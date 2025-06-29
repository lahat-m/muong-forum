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
import { plainToClass } from 'class-transformer';
import { FilesService } from '../files/files.service';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  /**
   * Creates a new student profile and associated skills.
   * Handles file upload for profile photo.
   * @param createStudentDto The DTO containing student and skill creation data.
   * @param profilePhotoFile The Multer file object for the profile photo.
   * @returns The newly created student with their skills and basic user info.
   */
  async create(createStudentDto: CreateStudentDto, profilePhotoFile?: Express.Multer.File) {
    // Declare profilePhotoUrl here so it's accessible in the catch block
    let profilePhotoUrl: string | undefined = undefined;

    try {
      this.logger.debug(`Attempting to create student for userId: ${createStudentDto.userId}`);

      // 1. Validate if the userId exists and is not already linked to a student
      const existingUser = await this.prisma.user.findUnique({
        where: { id: createStudentDto.userId },
        include: { studentProfile: true },
      });

      if (!existingUser) {
        this.logger.warn(`User with ID ${createStudentDto.userId} not found for student creation.`);
        throw new NotFoundException(`User with ID ${createStudentDto.userId} not found.`);
      }
      if (existingUser.studentProfile) {
        this.logger.warn(`User with ID ${createStudentDto.userId} already has a student profile.`);
        throw new ConflictException(`User with ID ${createStudentDto.userId} already has a student profile.`);
      }

      // 2. Handle profile photo upload if a file is provided
      if (profilePhotoFile) {
        profilePhotoUrl = this.filesService.saveLocalFile(profilePhotoFile);
        this.logger.debug(`Profile photo saved locally: ${profilePhotoUrl}`);
      } else if (createStudentDto.profilePhoto) {
        // If a file is not uploaded but a URL is provided in DTO (e.g., from an existing photo)
        profilePhotoUrl = createStudentDto.profilePhoto;
      }


      this.logger.debug('User existence and profile checks passed. Proceeding with student creation transaction.');

      // 3. Perform student and skill creation within a transaction for atomicity
      const studentResult = await this.prisma.$transaction(async (prisma) => {
        // Log data before creating student
        this.logger.debug(`Creating student with data: ${JSON.stringify({
          userId: createStudentDto.userId,
          name: createStudentDto.name,
          registrationNumber: createStudentDto.registrationNumber,
          course: createStudentDto.course,
          faculty: createStudentDto.faculty,
          graduated: createStudentDto.graduated ?? false,
          enrollmentYear: createStudentDto.enrollmentYear,
          profilePhoto: profilePhotoUrl,
        })}`);

        const newStudent = await prisma.student.create({
          data: {
            userId: createStudentDto.userId,
            name: createStudentDto.name,
            registrationNumber: createStudentDto.registrationNumber,
            course: createStudentDto.course,
            faculty: createStudentDto.faculty,
            graduated: createStudentDto.graduated ?? false,
            enrollmentYear: createStudentDto.enrollmentYear,
            profilePhoto: profilePhotoUrl,
          },
        });

        this.logger.debug(`New student created successfully with ID: ${newStudent.id}`);

        // 4. Create associated skills if provided
        if (createStudentDto.skills && createStudentDto.skills.length > 0) {
          const transformedSkills = createStudentDto.skills.map(skill =>
            plainToClass(CreateStudentSkillDto, skill)
          );

          this.logger.debug(`Transformed Skills for createMany: ${JSON.stringify(transformedSkills)}`);

          const skillData = transformedSkills.map((skillDto) => {
            if (!skillDto.name || skillDto.yearsOfExperience === undefined || skillDto.yearsOfExperience === null) {
              this.logger.error(`Invalid skill data detected: ${JSON.stringify(skillDto)}`);
              throw new BadRequestException('Skill name and years of experience are required for all skills.');
            }
            return {
              studentId: newStudent.id,
              name: skillDto.name,
              yearsOfExperience: skillDto.yearsOfExperience,
            };
          });

          this.logger.debug(`Preparing to create ${skillData.length} skills for student ID ${newStudent.id}`);
          await prisma.studentSkill.createMany({
            data: skillData,
            skipDuplicates: true,
          });
          this.logger.debug(`Successfully created skills for student ID: ${newStudent.id}`);
        }
        return newStudent;
      });

      // 5. Fetch the created student with all relations for the response
      this.logger.debug(`Fetching complete student profile for ID: ${studentResult.id}`);
      return await this.prisma.student.findUnique({
        where: { id: studentResult.id },
        include: { skills: true, user: { select: { id: true, email: true, username: true } } },
      });

    } catch (error) {
      // If an error occurs after file upload but before DB commit, delete the file
      if (profilePhotoFile && profilePhotoUrl) { // profilePhotoUrl is now correctly in scope
        this.filesService.deleteLocalFile(profilePhotoUrl);
        this.logger.warn(`Cleaned up uploaded file due to error: ${profilePhotoUrl}`);
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target;
          let conflictMessage = 'A record with this value already exists.';
          if (Array.isArray(target) && target.includes('registrationNumber')) {
            conflictMessage = 'Student with this registration number already exists.';
          } else if (Array.isArray(target) && target.includes('userId')) {
            conflictMessage = `User with ID ${createStudentDto.userId} already has a student profile.`;
          }
          this.logger.warn(`Prisma unique constraint violation: ${conflictMessage}. Error: ${error.message}`);
          throw new ConflictException(conflictMessage);
        } else if (error.code === 'P2003') {
          this.logger.error(`Prisma foreign key constraint failed during student creation: ${error.message}`);
          throw new BadRequestException('Invalid data provided (e.g., non-existent foreign key).');
        }
        this.logger.error(`Unhandled Prisma error during student creation (Code: ${error.code}): ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to create student profile due to a database error.');
      }
      else if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      else {
        this.logger.error(`Unexpected error during student creation: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to create student profile due to an unexpected error.');
      }
    }
  }

  async findAll() {
    return this.prisma.student.findMany({
      include: { skills: true, user: { select: { id: true, email: true, username: true } } },
    });
  }

  async findOne(id: number) {
    this.logger.debug(`Fetching student profile with ID: ${id}`);
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { skills: true, user: { select: { id: true, email: true, username: true } } },
    });
    if (!student) {
      this.logger.warn(`Student with ID ${id} not found.`);
      throw new NotFoundException(`Student with ID ${id} not found.`);
    }
    return student;
  }

  /**
   * Updates an existing student profile and their skills.
   * Handles updating existing skills, adding new skills, and optionally deleting skills.
   * Handles file upload for profile photo.
   * Uses a Prisma transaction for atomicity.
   * @param id The ID of the student to update.
   * @param updateStudentDto The DTO containing update data.
   * @param profilePhotoFile The Multer file object for the new profile photo (optional).
   * @returns The updated student profile.
   */
  async update(id: number, updateStudentDto: UpdateStudentDto, profilePhotoFile?: Express.Multer.File) {
    // Declare profilePhotoUrl here so it's accessible in the catch block
    let profilePhotoUrl: string | null | undefined = undefined; // Can be null if explicitly removed

    try {
      this.logger.debug(`Attempting to update student with ID: ${id}`);
      const existingStudent = await this.findOne(id); // Ensure student exists and get current data

      profilePhotoUrl = existingStudent.profilePhoto; // Initialize with existing photo URL

      if (profilePhotoFile) {
        // If a new file is uploaded, save it and update the URL
        profilePhotoUrl = this.filesService.saveLocalFile(profilePhotoFile);
        this.logger.debug(`New profile photo saved locally: ${profilePhotoUrl}`);

        // OPTIONAL: Delete old photo if it exists and a new one is uploaded
        if (existingStudent.profilePhoto && existingStudent.profilePhoto !== profilePhotoUrl) {
          this.filesService.deleteLocalFile(existingStudent.profilePhoto);
          this.logger.debug(`Old profile photo deleted: ${existingStudent.profilePhoto}`);
        }
      } else if (updateStudentDto.profilePhoto === null) {
        // If profilePhoto is explicitly set to null in DTO, it means user wants to remove it
        if (existingStudent.profilePhoto) {
          this.filesService.deleteLocalFile(existingStudent.profilePhoto);
          this.logger.debug(`Profile photo explicitly removed for student ID ${id}`);
        }
        profilePhotoUrl = null; // Set to null in DB
      } else if (updateStudentDto.profilePhoto !== undefined) {
        // If profilePhoto is provided as a URL string in the DTO (and no file uploaded)
        // this handles cases where user might send a different URL directly without a file upload
        profilePhotoUrl = updateStudentDto.profilePhoto;
      }
      // If profilePhotoFile is undefined AND updateStudentDto.profilePhoto is undefined,
      // it means no change to profile photo, so profilePhotoUrl remains existingStudent.profilePhoto


      const updatedStudent = await this.prisma.$transaction(async (prisma) => {
        // Update basic student information
        this.logger.debug(`Updating basic student data for ID ${id}: ${JSON.stringify({ ...updateStudentDto, profilePhoto: profilePhotoUrl })}`);
        const student = await prisma.student.update({
          where: { id },
          data: {
            name: updateStudentDto.name,
            registrationNumber: updateStudentDto.registrationNumber,
            course: updateStudentDto.course,
            faculty: updateStudentDto.faculty,
            graduated: updateStudentDto.graduated,
            enrollmentYear: updateStudentDto.enrollmentYear,
            profilePhoto: profilePhotoUrl,
          },
        });
        this.logger.debug(`Basic student data for ID ${id} updated.`);

        // Handle skills update/creation/deletion
        if (updateStudentDto.skills) {
           this.logger.debug(`Processing skills update for student ID: ${id}`);
           const transformedUpdateSkills = updateStudentDto.skills.map(skill =>
             plainToClass(UpdateStudentSkillDto, skill)
           );
           this.logger.debug(`Transformed Skills for update: ${JSON.stringify(transformedUpdateSkills)}`);

          const existingSkills = await prisma.studentSkill.findMany({
            where: { studentId: id },
            select: { id: true, name: true },
          });
          const existingSkillNames = new Set(existingSkills.map((s) => s.name));

          for (const skillDto of transformedUpdateSkills) {
            if (skillDto.id !== undefined && skillDto.id !== null) {
              this.logger.debug(`Updating existing skill ID ${skillDto.id} for student ID ${id}.`);
              await prisma.studentSkill.update({
                where: { id: skillDto.id, studentId: id },
                data: {
                  name: skillDto.name,
                  yearsOfExperience: skillDto.yearsOfExperience,
                },
              });
            } else {
              this.logger.debug(`Creating new skill for student ID ${id}: ${JSON.stringify(skillDto)}.`);
              if (!skillDto.name) {
                this.logger.warn(`Attempted to create a new skill without a name for student ID ${id}.`);
                throw new BadRequestException("Skill name is required for new skills.");
              }
              if (existingSkillNames.has(skillDto.name)) {
                this.logger.warn(`Attempted to add duplicate skill '${skillDto.name}' for student ID ${id}. Skipping creation.`);
                throw new ConflictException(`Skill '${skillDto.name}' already exists for student ID ${id}.`);
              }
              await prisma.studentSkill.create({
                data: {
                  studentId: id,
                  name: skillDto.name,
                  yearsOfExperience: skillDto.yearsOfExperience ?? 0,
                },
              });
            }
          }

          const incomingSkillIds = new Set(
            transformedUpdateSkills
              .filter(s => s.id !== undefined && s.id !== null)
              .map(s => s.id as number)
          );
          const skillsToDelete = existingSkills.filter(s => !incomingSkillIds.has(s.id));

          if (skillsToDelete.length > 0) {
            this.logger.debug(`Deleting ${skillsToDelete.length} skills no longer present in update payload for student ID ${id}.`);
            await prisma.studentSkill.deleteMany({
              where: {
                id: { in: skillsToDelete.map(s => s.id) },
                studentId: id,
              },
            });
            this.logger.debug('Skills successfully deleted.');
          }
          this.logger.debug('Skills update process completed.');
        }
        return student;
      });

      this.logger.debug(`Fetching complete updated student profile for ID: ${updatedStudent.id}`);
      return await this.prisma.student.findUnique({
        where: { id: updatedStudent.id },
        include: { skills: true, user: { select: { id: true, email: true, username: true } } },
      });

    } catch (error) {
      // If an error occurs after new file upload but before DB commit, delete the newly uploaded file
      if (profilePhotoFile && profilePhotoUrl) { // profilePhotoUrl is now correctly in scope
        this.filesService.deleteLocalFile(profilePhotoUrl);
        this.logger.warn(`Cleaned up newly uploaded file due to error: ${profilePhotoUrl}`);
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target;
          let conflictMessage = 'A record with this value already exists.';
          if (Array.isArray(target) && target.includes('registrationNumber')) {
            conflictMessage = 'Student with this registration number already exists.';
          }
          this.logger.warn(`Prisma unique constraint violation during update: ${conflictMessage}. Error: ${error.message}`);
          throw new ConflictException(conflictMessage);
        }
        this.logger.error(`Unhandled Prisma error during student update (Code: ${error.code}): ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to update student profile due to a database error.');
      }
      else if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      else {
        this.logger.error(`Unexpected error during student update: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to update student profile due to an unexpected error.');
      }
    }
  }

  async remove(id: number) {
    try {
      this.logger.debug(`Attempting to delete student with ID: ${id}`);
      const studentToDelete = await this.findOne(id);

      const deletedStudent = await this.prisma.student.delete({
        where: { id },
      });

      // Delete the associated profile photo from local storage
      if (studentToDelete.profilePhoto) {
        this.filesService.deleteLocalFile(studentToDelete.profilePhoto);
        this.logger.log(`Associated profile photo deleted for student ID ${id}: ${studentToDelete.profilePhoto}`);
      }

      this.logger.log(`Student with ID ${id} successfully deleted.`);
      return { message: `Student with ID ${id} successfully deleted.` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting student with ID ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to delete student with ID ${id}.`);
    }
  }

  async addSkillToStudent(studentId: number, createStudentSkillDto: CreateStudentSkillDto) {
    try {
      this.logger.debug(`Attempting to add skill to student ID ${studentId}: ${JSON.stringify(createStudentSkillDto)}`);
      await this.findOne(studentId);

      if (!createStudentSkillDto.name || createStudentSkillDto.yearsOfExperience === undefined || createStudentSkillDto.yearsOfExperience === null) {
        throw new BadRequestException('Skill name and years of experience are required.');
      }

      const existingSkill = await this.prisma.studentSkill.findUnique({
        where: {
          studentId_name: { studentId, name: createStudentSkillDto.name },
        },
      });

      if (existingSkill) {
        this.logger.warn(`Skill '${createStudentSkillDto.name}' already exists for student ID ${studentId}.`);
        throw new ConflictException(`Skill '${createStudentSkillDto.name}' already exists for student ID ${studentId}.`);
      }

      const skill = await this.prisma.studentSkill.create({
        data: {
          studentId,
          name: createStudentSkillDto.name,
          yearsOfExperience: createStudentSkillDto.yearsOfExperience,
        },
      });
      this.logger.log(`Skill '${skill.name}' added to student ID ${studentId} with ID ${skill.id}.`);
      return skill;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error adding skill to student ${studentId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to add skill.');
    }
  }

  async updateStudentSkill(studentId: number, skillId: number, updateStudentSkillDto: UpdateStudentSkillDto) {
    try {
      this.logger.debug(`Attempting to update skill ID ${skillId} for student ID ${studentId}: ${JSON.stringify(updateStudentSkillDto)}`);
      await this.findOne(studentId);

      const skill = await this.prisma.studentSkill.findUnique({
        where: { id: skillId, studentId },
      });

      if (!skill) {
        this.logger.warn(`Skill with ID ${skillId} not found for student ID ${studentId}.`);
        throw new NotFoundException(`Skill with ID ${skillId} not found for student ID ${studentId}.`);
      }

      if (updateStudentSkillDto.name && updateStudentSkillDto.name !== skill.name) {
        const existingSkillWithName = await this.prisma.studentSkill.findUnique({
          where: {
            studentId_name: { studentId, name: updateStudentSkillDto.name },
          },
        });
        if (existingSkillWithName) {
          this.logger.warn(`Skill '${updateStudentSkillDto.name}' already exists for student ID ${studentId} (conflict during update).`);
          throw new ConflictException(`Skill '${updateStudentSkillDto.name}' already exists for student ID ${studentId}.`);
        }
      }

      const updatedSkill = await this.prisma.studentSkill.update({
        where: { id: skillId },
        data: {
          name: updateStudentSkillDto.name,
          yearsOfExperience: updateStudentSkillDto.yearsOfExperience,
        },
      });
      this.logger.log(`Skill ID ${skillId} for student ID ${studentId} updated successfully.`);
      return updatedSkill;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error updating skill ${skillId} for student ${studentId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update skill.');
    }
  }

  async removeStudentSkill(studentId: number, skillId: number) {
    try {
      this.logger.debug(`Attempting to remove skill ID ${skillId} from student ID ${studentId}.`);
      await this.findOne(studentId);

      const skill = await this.prisma.studentSkill.findUnique({
        where: { id: skillId, studentId },
      });

      if (!skill) {
        this.logger.warn(`Skill with ID ${skillId} not found for student ID ${studentId}.`);
        throw new NotFoundException(`Skill with ID ${skillId} not found for student ID ${studentId}.`);
      }

      await this.prisma.studentSkill.delete({
        where: { id: skillId },
      });
      this.logger.log(`Skill ID ${skillId} successfully removed from student ID ${studentId}.`);
      return { message: `Skill with ID ${skillId} successfully removed from student ${studentId}.` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing skill ${skillId} from student ${studentId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to remove skill.');
    }
  }
}
