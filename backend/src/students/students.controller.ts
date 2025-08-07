// src/students/students.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Logger,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateStudentSkillDto } from './dto/create-student-skill.dto';
import { UpdateStudentSkillDto } from './dto/update-student-skill.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { StudentResponseDto } from './dto/student-response.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { PaginatedResponseDto } from './dto/pagination-response.dto';

// Constants for file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = /(jpg|jpeg|png|gif|webp)$/i;

@Controller('students')
@ApiTags('Students')
@UseGuards(RateLimitGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@UsePipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
}))
export class StudentsController {
  private readonly logger = new Logger(StudentsController.name);

  constructor(private readonly studentsService: StudentsService) { }

  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('profilePhoto'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new student profile with optional photo',
    description: 'Creates a new student profile. Requires admin privileges. Supports file upload for profile photo.',
  })
  @ApiBody({
    description: 'Student creation data with optional profile photo',
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'integer',
          example: 1,
          description: 'ID of the user to create student profile for',
        },
        name: {
          type: 'string',
          example: 'Jane Doe',
          minLength: 2,
          maxLength: 100,
        },
        registrationNumber: {
          type: 'string',
          example: 'STU12345',
          pattern: '^[A-Z]{3}[0-9]{5}$',
        },
        course: {
          type: 'string',
          example: 'Computer Science',
          minLength: 2,
          maxLength: 100,
        },
        faculty: {
          type: 'string',
          example: 'Engineering',
          minLength: 2,
          maxLength: 100,
        },
        graduated: {
          type: 'boolean',
          example: false,
          default: false,
        },
        enrollmentYear: {
          type: 'integer',
          example: 2020,
          minimum: 1900,
          maximum: new Date().getFullYear() + 1,
        },
        profilePhoto: {
          type: 'string',
          format: 'binary',
          description: 'Student profile photo (JPG, JPEG, PNG, GIF, WEBP, max 5MB)',
        },
        skills: {
          type: 'string',
          description: 'JSON string of student skills array',
          example: '[{"name":"React.js","yearsOfExperience":3}]',
        },
      },
      required: ['userId', 'name', 'registrationNumber', 'course', 'faculty', 'enrollmentYear'],
    },
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Student profile created successfully',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or file validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: ['Invalid file type. Only JPG, JPEG, PNG, GIF, WEBP are allowed'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Authentication required' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Admin privileges required' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Student profile already exists' })
  @ApiResponse({ status: HttpStatus.UNPROCESSABLE_ENTITY, description: 'File validation failed' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }),
        ],
        fileIsRequired: false,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
    ) profilePhotoFile?: Express.Multer.File,
  ): Promise<StudentResponseDto> {
    this.logger.log(`Creating student profile for userId: ${createStudentDto.userId}`);

    // Parse skills if provided as string (multipart form data)
    if (typeof createStudentDto.skills === 'string') {
      try {
        createStudentDto.skills = JSON.parse(createStudentDto.skills as string);
      } catch (error) {
        this.logger.warn(`Invalid JSON in skills field: ${error.message}`);
        throw new BadRequestException('Skills field must be a valid JSON array');
      }
    }

    const result = await this.studentsService.create(createStudentDto, profilePhotoFile);
    this.logger.log(`Successfully created student profile with ID: ${result.id}`);

    return result;
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve student profiles with pagination and filtering',
    description: 'Returns a paginated list of student profiles with optional filtering',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or registration number' })
  @ApiQuery({ name: 'course', required: false, type: String, description: 'Filter by course' })
  @ApiQuery({ name: 'faculty', required: false, type: String, description: 'Filter by faculty' })
  @ApiQuery({ name: 'graduated', required: false, type: Boolean, description: 'Filter by graduation status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of student profiles retrieved successfully',
    type: PaginatedResponseDto<StudentResponseDto>,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid query parameters' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async findAll(@Query() query: StudentQueryDto): Promise<PaginatedResponseDto<StudentResponseDto>> {
    this.logger.log(`Retrieving students with query: ${JSON.stringify(query)}`);
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a student profile by ID',
    description: 'Returns detailed information about a specific student including skills and user data',
  })
  @ApiParam({ name: 'id', type: 'integer', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student profile retrieved successfully',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid student ID format' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Student not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<StudentResponseDto> {
    this.logger.log(`Retrieving student profile for ID: ${id}`);
    const result = await this.studentsService.findOne(id);
    this.logger.log(`Successfully retrieved student profile for ID: ${id}`);
    return result;
  }

  @Patch(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('profilePhoto'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update student profile by ID',
    description: 'Updates an existing student profile. Requires admin privileges. Supports file upload for profile photo.',
  })
  @ApiParam({ name: 'id', type: 'integer', description: 'Student ID' })

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student profile updated successfully',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data or student ID' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Authentication required' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Admin privileges required' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Student not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Duplicate data conflict' })
  @ApiResponse({ status: HttpStatus.UNPROCESSABLE_ENTITY, description: 'File validation failed' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }),
        ],
        fileIsRequired: false,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
    ) profilePhotoFile?: Express.Multer.File,
  ): Promise<StudentResponseDto> {
    this.logger.log(`Updating student profile for ID: ${id}`);

    // Parse skills if provided as string (multipart form data)
    if (typeof updateStudentDto.skills === 'string') {
      try {
        updateStudentDto.skills = JSON.parse(updateStudentDto.skills as string);
      } catch (error) {
        this.logger.warn(`Invalid JSON in skills field for update: ${error.message}`);
        throw new BadRequestException('Skills field must be a valid JSON array');
      }
    }

    const result = await this.studentsService.update(id, updateStudentDto, profilePhotoFile);
    this.logger.log(`Successfully updated student profile for ID: ${id}`);

    return result;
  }

  @Delete(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete student profile by ID',
    description: 'Permanently deletes a student profile and associated data. Requires admin privileges.',
  })
  @ApiParam({ name: 'id', type: 'integer', description: 'Student ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Student profile deleted successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid student ID format' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Authentication required' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Admin privileges required' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Student not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Deleting student profile for ID: ${id}`);
    await this.studentsService.remove(id);
    this.logger.log(`Successfully deleted student profile for ID: ${id}`);
  }

  // Student Skills Management Endpoints
  @Post(':studentId/skills')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({
    summary: 'Add skill to student',
    description: 'Adds a new skill to a student profile. Requires admin privileges.',
  })
  @ApiParam({ name: 'studentId', type: 'integer', description: 'Student ID' })
  @ApiBody({
    type: CreateStudentSkillDto,
    description: 'Skill data to add to student profile',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Skill added successfully',
    type: CreateStudentSkillDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid skill data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Authentication required' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Admin privileges required' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Student not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Skill already exists for student' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async addSkill(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() createStudentSkillDto: CreateStudentSkillDto,
  ) {
    this.logger.log(`Adding skill to student ${studentId}: ${createStudentSkillDto.name}`);
    const result = await this.studentsService.addSkillToStudent(studentId, createStudentSkillDto);
    this.logger.log(`Successfully added skill to student ${studentId}`);
    return result;
  }

  @Patch(':studentId/skills/:skillId')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({
    summary: 'Update student skill',
    description: 'Updates an existing skill for a student. Requires admin privileges.',
  })
  @ApiParam({ name: 'studentId', type: 'integer', description: 'Student ID' })
  @ApiParam({ name: 'skillId', type: 'integer', description: 'Skill ID' })
  @ApiBody({
    type: UpdateStudentSkillDto,
    description: 'Updated skill data',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Skill updated successfully',
    type: UpdateStudentSkillDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid skill data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Authentication required' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Admin privileges required' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Student or skill not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Skill name already exists for student' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async updateSkill(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
    @Body() updateStudentSkillDto: UpdateStudentSkillDto,
  ) {
    this.logger.log(`Updating skill ${skillId} for student ${studentId}`);
    const result = await this.studentsService.updateStudentSkill(studentId, skillId, updateStudentSkillDto);
    this.logger.log(`Successfully updated skill ${skillId} for student ${studentId}`);
    return result;
  }

  @Delete(':studentId/skills/:skillId')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove skill from student',
    description: 'Removes a skill from a student profile. Requires admin privileges.',
  })
  @ApiParam({ name: 'studentId', type: 'integer', description: 'Student ID' })
  @ApiParam({ name: 'skillId', type: 'integer', description: 'Skill ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Skill removed successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid ID format' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Authentication required' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Admin privileges required' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Student or skill not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async removeSkill(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
  ): Promise<void> {
    this.logger.log(`Removing skill ${skillId} from student ${studentId}`);
    await this.studentsService.removeStudentSkill(studentId, skillId);
    this.logger.log(`Successfully removed skill ${skillId} from student ${studentId}`);
  }
}