// src/students/students.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateStudentSkillDto } from './dto/create-student-skill.dto';
import { UpdateStudentSkillDto } from './dto/update-student-skill.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { plainToInstance } from 'class-transformer';
import { FilesService } from '../files/files.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { CacheService } from 'src/cache/cache.service';
import { PaginatedResponseDto } from './dto/pagination-response.dto';

// Events for student operations
export const STUDENT_EVENTS = {
  CREATED: 'student.created',
  UPDATED: 'student.updated',
  DELETED: 'student.deleted',
  SKILL_ADDED: 'student.skill.added',
  SKILL_UPDATED: 'student.skill.updated',
  SKILL_REMOVED: 'student.skill.removed',
} as const;

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_PREFIX = 'student';

  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  /**
   * Creates a new student profile with associated skills and optional profile photo.
   * @param createStudentDto The DTO containing student creation data
   * @param profilePhotoFile Optional profile photo file
   * @returns The created student profile
   */
  async create(
    createStudentDto: CreateStudentDto,
    profilePhotoFile?: Express.Multer.File
  ): Promise<StudentResponseDto> {
    let profilePhotoUrl: string | undefined;

    try {
      this.logger.debug(`Creating student profile for userId: ${createStudentDto.userId}`);

      // Validate user existence and student profile uniqueness
      await this.validateUserForStudentCreation(createStudentDto.userId);

      // Handle profile photo upload
      if (profilePhotoFile) {
        profilePhotoUrl = await this.filesService.saveLocalFile(profilePhotoFile);
        this.logger.debug(`Profile photo saved: ${profilePhotoUrl}`);
      } else if (createStudentDto.profilePhoto) {
        profilePhotoUrl = createStudentDto.profilePhoto;
      }

      // Create student and skills in transaction
      const student = await this.createStudentWithTransaction({
        ...createStudentDto,
        profilePhoto: profilePhotoUrl,
      });

      // Transform to response DTO
      const response = plainToInstance(StudentResponseDto, student, {
        excludeExtraneousValues: true,
      });

      // Invalidate related caches
      await this.invalidateStudentCaches();

      // Emit event
      this.eventEmitter.emit(STUDENT_EVENTS.CREATED, {
        studentId: student.id,
        userId: student.userId,
        timestamp: new Date(),
      });

      this.logger.log(`Successfully created student profile with ID: ${student.id}`);
      return response;

    } catch (error) {
      // Cleanup uploaded file on error
      if (profilePhotoFile && profilePhotoUrl) {
        await this.cleanupFile(profilePhotoUrl);
      }
      throw this.handleError(error, 'create student profile');
    }
  }

  /**
   * Retrieves paginated student profiles with filtering and searching
   * @param query Query parameters for filtering and pagination
   * @returns Paginated student profiles
   */
  async findAll(query: StudentQueryDto): Promise<PaginatedResponseDto<StudentResponseDto>> {
    try {
      this.logger.debug(`Retrieving students with query: ${JSON.stringify(query)}`);

      const cacheKey = `${this.CACHE_PREFIX}:list:${JSON.stringify(query)}`;
      const cached = await this.cacheService.get<PaginatedResponseDto<StudentResponseDto>>(cacheKey);

      if (cached) {
        this.logger.debug('Returning cached student list');
        return cached;
      }

      const { page = 1, limit = 10, search, course, faculty, graduated, sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.StudentWhereInput = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { registrationNumber: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(course && { course: { contains: course, mode: 'insensitive' } }),
        ...(faculty && { faculty: { contains: faculty, mode: 'insensitive' } }),
        ...(graduated !== undefined && { graduated }),
      };

      // Execute queries in parallel
      const [students, total] = await Promise.all([
        this.prisma.student.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            skills: {
              orderBy: { name: 'asc' },
            },
            user: {
              select: { id: true, email: true, username: true },
            },
          },
        }),
        this.prisma.student.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      const result: PaginatedResponseDto<StudentResponseDto> = {
        data: plainToInstance(StudentResponseDto, students, {
          excludeExtraneousValues: true,
        }),
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };

      // Cache the result
      await this.cacheService.set(cacheKey, result, this.CACHE_TTL);

      this.logger.debug(`Retrieved ${students.length} students (page ${page}/${totalPages})`);
      return result;

    } catch (error) {
      throw this.handleError(error, 'retrieve students');
    }
  }

  /**
   * Retrieves a single student profile by ID
   * @param id Student ID
   * @returns Student profile
   */
  async findOne(id: number): Promise<StudentResponseDto> {
    try {
      this.logger.debug(`Retrieving student profile for ID: ${id}`);

      const cacheKey = `${this.CACHE_PREFIX}:${id}`;
      const cached = await this.cacheService.get<StudentResponseDto>(cacheKey);

      if (cached) {
        this.logger.debug(`Returning cached student profile for ID: ${id}`);
        return cached;
      }

      const student = await this.prisma.student.findUnique({
        where: { id },
        include: {
          skills: {
            orderBy: { name: 'asc' },
          },
          user: {
            select: { id: true, email: true, username: true },
          },
        },
      });

      if (!student) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      const response = plainToInstance(StudentResponseDto, student, {
        excludeExtraneousValues: true,
      });

      // Cache the result
      await this.cacheService.set(cacheKey, response, this.CACHE_TTL);

      this.logger.debug(`Successfully retrieved student profile for ID: ${id}`);
      return response;

    } catch (error) {
      throw this.handleError(error, `retrieve student with ID ${id}`);
    }
  }

  /**
   * Updates an existing student profile
   * @param id Student ID
   * @param updateStudentDto Update data
   * @param profilePhotoFile Optional new profile photo
   * @returns Updated student profile
   */
  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
    profilePhotoFile?: Express.Multer.File
  ): Promise<StudentResponseDto> {
    let newProfilePhotoUrl: string | null | undefined;

    try {
      this.logger.debug(`Updating student profile for ID: ${id}`);

      // Get existing student
      const existingStudent = await this.findExistingStudent(id);

      // Handle profile photo update
      newProfilePhotoUrl = await this.handleProfilePhotoUpdate(
        existingStudent.profilePhoto,
        updateStudentDto.profilePhoto,
        profilePhotoFile
      );

      // Update student in transaction
      const updatedStudent = await this.updateStudentWithTransaction(
        id,
        { ...updateStudentDto, profilePhoto: newProfilePhotoUrl },
        existingStudent
      );

      // Transform to response DTO
      const response = plainToInstance(StudentResponseDto, updatedStudent, {
        excludeExtraneousValues: true,
      });

      // Invalidate caches
      await this.invalidateStudentCaches(id);

      // Emit event
      this.eventEmitter.emit(STUDENT_EVENTS.UPDATED, {
        studentId: id,
        userId: updatedStudent.userId,
        changes: updateStudentDto,
        timestamp: new Date(),
      });

      this.logger.log(`Successfully updated student profile for ID: ${id}`);
      return response;

    } catch (error) {
      // Cleanup newly uploaded file on error
      if (profilePhotoFile && newProfilePhotoUrl) {
        await this.cleanupFile(newProfilePhotoUrl);
      }
      throw this.handleError(error, `update student with ID ${id}`);
    }
  }

  /**
   * Removes a student profile and associated data
   * @param id Student ID
   */
  async remove(id: number): Promise<void> {
    try {
      this.logger.debug(`Deleting student profile for ID: ${id}`);

      const student = await this.findExistingStudent(id);

      // Delete student and cleanup files
      await this.prisma.student.delete({ where: { id } });

      // Delete associated profile photo
      if (student.profilePhoto) {
        await this.cleanupFile(student.profilePhoto);
      }

      // Invalidate caches
      await this.invalidateStudentCaches(id);

      // Emit event
      this.eventEmitter.emit(STUDENT_EVENTS.DELETED, {
        studentId: id,
        userId: student.userId,
        timestamp: new Date(),
      });

      this.logger.log(`Successfully deleted student profile for ID: ${id}`);

    } catch (error) {
      throw this.handleError(error, `delete student with ID ${id}`);
    }
  }

  /**
   * Adds a skill to a student profile
   */
  async addSkillToStudent(
    studentId: number,
    createStudentSkillDto: CreateStudentSkillDto
  ) {
    try {
      this.logger.debug(`Adding skill to student ${studentId}: ${createStudentSkillDto.name}`);

      await this.validateStudentExists(studentId);
      await this.validateSkillUniqueness(studentId, createStudentSkillDto.name);

      const skill = await this.prisma.studentSkill.create({
        data: {
          studentId,
          name: createStudentSkillDto.name.trim(),
          yearsOfExperience: createStudentSkillDto.yearsOfExperience,
        },
      });

      // Invalidate caches
      await this.invalidateStudentCaches(studentId);

      // Emit event
      this.eventEmitter.emit(STUDENT_EVENTS.SKILL_ADDED, {
        studentId,
        skillId: skill.id,
        skillName: skill.name,
        timestamp: new Date(),
      });

      this.logger.log(`Successfully added skill '${skill.name}' to student ${studentId}`);
      return skill;

    } catch (error) {
      throw this.handleError(error, `add skill to student ${studentId}`);
    }
  }

  /**
   * Updates a student's skill
   */
  async updateStudentSkill(
    studentId: number,
    skillId: number,
    updateStudentSkillDto: UpdateStudentSkillDto
  ) {
    try {
      this.logger.debug(`Updating skill ${skillId} for student ${studentId}`);

      await this.validateStudentExists(studentId);
      const existingSkill = await this.findExistingSkill(studentId, skillId);

      // Check for name conflicts if name is being changed
      if (updateStudentSkillDto.name &&
        updateStudentSkillDto.name !== existingSkill.name) {
        await this.validateSkillUniqueness(studentId, updateStudentSkillDto.name);
      }

      const updatedSkill = await this.prisma.studentSkill.update({
        where: { id: skillId },
        data: {
          ...(updateStudentSkillDto.name && { name: updateStudentSkillDto.name.trim() }),
          ...(updateStudentSkillDto.yearsOfExperience !== undefined && {
            yearsOfExperience: updateStudentSkillDto.yearsOfExperience,
          }),
        },
      });

      // Invalidate caches
      await this.invalidateStudentCaches(studentId);

      // Emit event
      this.eventEmitter.emit(STUDENT_EVENTS.SKILL_UPDATED, {
        studentId,
        skillId,
        skillName: updatedSkill.name,
        timestamp: new Date(),
      });

      this.logger.log(`Successfully updated skill ${skillId} for student ${studentId}`);
      return updatedSkill;

    } catch (error) {
      throw this.handleError(error, `update skill ${skillId} for student ${studentId}`);
    }
  }

  /**
   * Removes a skill from a student profile
   */
  async removeStudentSkill(studentId: number, skillId: number): Promise<void> {
    try {
      this.logger.debug(`Removing skill ${skillId} from student ${studentId}`);

      await this.validateStudentExists(studentId);
      const skill = await this.findExistingSkill(studentId, skillId);

      await this.prisma.studentSkill.delete({ where: { id: skillId } });

      // Invalidate caches
      await this.invalidateStudentCaches(studentId);

      // Emit event
      this.eventEmitter.emit(STUDENT_EVENTS.SKILL_REMOVED, {
        studentId,
        skillId,
        skillName: skill.name,
        timestamp: new Date(),
      });

      this.logger.log(`Successfully removed skill ${skillId} from student ${studentId}`);

    } catch (error) {
      throw this.handleError(error, `remove skill ${skillId} from student ${studentId}`);
    }
  }

  // Private helper methods

  private async validateUserForStudentCreation(userId: number): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (existingUser.studentProfile) {
      throw new ConflictException(`User with ID ${userId} already has a student profile`);
    }
  }

  private async createStudentWithTransaction(data: CreateStudentDto & { profilePhoto?: string }) {
    return this.prisma.$transaction(async (prisma) => {
      const student = await prisma.student.create({
        data: {
          userId: data.userId,
          name: data.name.trim(),
          registrationNumber: data.registrationNumber.toUpperCase(),
          course: data.course.trim(),
          faculty: data.faculty.trim(),
          graduated: data.graduated ?? false,
          enrollmentYear: data.enrollmentYear,
          profilePhoto: data.profilePhoto,
        },
      });

      // Create skills if provided
      if (data.skills?.length) {
        const skillsData = data.skills.map(skill => ({
          studentId: student.id,
          name: skill.name.trim(),
          yearsOfExperience: skill.yearsOfExperience,
        }));

        await prisma.studentSkill.createMany({
          data: skillsData,
          skipDuplicates: true,
        });
      }

      // Return student with relations
      return prisma.student.findUnique({
        where: { id: student.id },
        include: {
          skills: { orderBy: { name: 'asc' } },
          user: { select: { id: true, email: true, username: true } },
        },
      });
    });
  }

  private async findExistingStudent(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { skills: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  private async validateStudentExists(id: number): Promise<void> {
    const exists = await this.prisma.student.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
  }

  private async findExistingSkill(studentId: number, skillId: number) {
    const skill = await this.prisma.studentSkill.findUnique({
      where: { id: skillId, studentId },
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${skillId} not found for student ${studentId}`);
    }

    return skill;
  }

  private async validateSkillUniqueness(studentId: number, skillName: string): Promise<void> {
    const existingSkill = await this.prisma.studentSkill.findUnique({
      where: {
        studentId_name: { studentId, name: skillName.trim() },
      },
    });

    if (existingSkill) {
      throw new ConflictException(`Skill '${skillName}' already exists for this student`);
    }
  }

  private async handleProfilePhotoUpdate(
    currentPhoto: string | null,
    dtoPhoto: string | null | undefined,
    uploadedFile?: Express.Multer.File
  ): Promise<string | null | undefined> {
    if (uploadedFile) {
      const newPhotoUrl = await this.filesService.saveLocalFile(uploadedFile);

      // Delete old photo if it exists
      if (currentPhoto && currentPhoto !== newPhotoUrl) {
        await this.cleanupFile(currentPhoto);
      }

      return newPhotoUrl;
    }

    if (dtoPhoto === null) {
      // Explicitly removing photo
      if (currentPhoto) {
        await this.cleanupFile(currentPhoto);
      }
      return null;
    }

    if (dtoPhoto !== undefined) {
      return dtoPhoto;
    }

    // No change
    return currentPhoto;
  }

  private async updateStudentWithTransaction(
    id: number,
    updateData: UpdateStudentDto & { profilePhoto?: string | null },
    existingStudent: any
  ) {
    return this.prisma.$transaction(async (prisma) => {
      // Update basic student information
      const student = await prisma.student.update({
        where: { id },
        data: {
          ...(updateData.name && { name: updateData.name.trim() }),
          ...(updateData.registrationNumber && {
            registrationNumber: updateData.registrationNumber.toUpperCase()
          }),
          ...(updateData.course && { course: updateData.course.trim() }),
          ...(updateData.faculty && { faculty: updateData.faculty.trim() }),
          ...(updateData.graduated !== undefined && { graduated: updateData.graduated }),
          ...(updateData.enrollmentYear && { enrollmentYear: updateData.enrollmentYear }),
          ...(updateData.profilePhoto !== undefined && { profilePhoto: updateData.profilePhoto }),
        },
      });

      // Handle skills update if provided
      if (updateData.skills) {
        await this.updateStudentSkills(prisma, id, updateData.skills, existingStudent.skills);
      }

      // Return updated student with relations
      return prisma.student.findUnique({
        where: { id },
        include: {
          skills: { orderBy: { name: 'asc' } },
          user: { select: { id: true, email: true, username: true } },
        },
      });
    });
  }

  private async updateStudentSkills(
    prisma: any,
    studentId: number,
    skills: UpdateStudentSkillDto[],
    existingSkills: any[]
  ): Promise<void> {
    const existingSkillIds = new Set(existingSkills.map(s => s.id));
    const incomingSkillIds = new Set(
      skills.filter(s => s.id).map(s => s.id as number)
    );

    // Process each skill in the update
    for (const skillDto of skills) {
      if (skillDto.id) {
        // Update existing skill
        await prisma.studentSkill.update({
          where: { id: skillDto.id, studentId },
          data: {
            ...(skillDto.name && { name: skillDto.name.trim() }),
            ...(skillDto.yearsOfExperience !== undefined && {
              yearsOfExperience: skillDto.yearsOfExperience,
            }),
          },
        });
      } else if (skillDto.name) {
        // Create new skill
        await prisma.studentSkill.create({
          data: {
            studentId,
            name: skillDto.name.trim(),
            yearsOfExperience: skillDto.yearsOfExperience ?? 0,
          },
        });
      }
    }

    // Delete skills not in the incoming list
    const skillsToDelete = Array.from(existingSkillIds).filter(
      id => !incomingSkillIds.has(id)
    );

    if (skillsToDelete.length > 0) {
      await prisma.studentSkill.deleteMany({
        where: {
          id: { in: skillsToDelete },
          studentId,
        },
      });
    }
  }

  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await this.filesService.deleteLocalFile(filePath);
      this.logger.debug(`Successfully cleaned up file: ${filePath}`);
    } catch (error) {
      this.logger.warn(`Failed to cleanup file ${filePath}: ${error.message}`);
    }
  }

  private async invalidateStudentCaches(studentId?: number): Promise<void> {
    try {
      const patterns = [`${this.CACHE_PREFIX}:list:*`];

      if (studentId) {
        patterns.push(`${this.CACHE_PREFIX}:${studentId}`);
      }

      await Promise.all(
        patterns.map(pattern => this.cacheService.delPattern(pattern))
      );

      this.logger.debug('Successfully invalidated student caches');
    } catch (error) {
      this.logger.warn(`Failed to invalidate caches: ${error.message}`);
    }
  }

  private handleError(error: any, operation: string): never {
    if (error instanceof NotFoundException ||
      error instanceof ConflictException ||
      error instanceof BadRequestException) {
      throw error;
    }

    if (error instanceof PrismaClientKnownRequestError) {
      return this.handlePrismaError(error, operation);
    }

    this.logger.error(`Unexpected error during ${operation}: ${error.message}`, error.stack);
    throw new InternalServerErrorException(`Failed to ${operation} due to an unexpected error`);
  }

  private handlePrismaError(error: PrismaClientKnownRequestError, operation: string): never {
    this.logger.error(`Prisma error during ${operation} (Code: ${error.code}): ${error.message}`, error.stack);

    switch (error.code) {
      case 'P2002':
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('registrationNumber')) {
          throw new ConflictException('Student with this registration number already exists');
        }
        if (target?.includes('userId')) {
          throw new ConflictException('User already has a student profile');
        }
        if (target?.includes('studentId_name')) {
          throw new ConflictException('Skill already exists for this student');
        }
        throw new ConflictException('A record with this value already exists');

      case 'P2003':
        throw new BadRequestException('Invalid reference to related data');

      case 'P2025':
        throw new NotFoundException('Record not found');

      default:
        throw new InternalServerErrorException(`Failed to ${operation} due to a database error`);
    }
  }
}