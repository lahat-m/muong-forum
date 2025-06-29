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
  UseInterceptors, // <--- Import UseInterceptors
  UploadedFile,
  BadRequestException,   // <--- Import UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // <--- Import FileInterceptor
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateStudentSkillDto } from './dto/create-student-skill.dto';
import { UpdateStudentSkillDto } from './dto/update-student-skill.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger'; // <--- Import ApiConsumes

import { JwtGuard } from '../auth/guards/jwt.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('students')
@ApiTags('Students')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  // @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('profilePhoto')) // <--- Intercept 'profilePhoto' field as a file
  @ApiConsumes('multipart/form-data') // <--- Indicate that the endpoint consumes form-data
  @ApiOperation({ summary: 'Create a new student profile with an optional photo (Admin only)' })
  @ApiBody({ // <--- Define the body for Swagger with file upload in mind
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Jane Doe' },
        registrationNumber: { type: 'string', example: 'STU12345' },
        course: { type: 'string', example: 'Computer Science' },
        faculty: { type: 'string', example: 'Engineering' },
        graduated: { type: 'boolean', example: false },
        enrollmentYear: { type: 'number', example: 2020 },
        profilePhoto: { // <--- Define profilePhoto as file type for Swagger
          type: 'string',
          format: 'binary',
          description: 'Student profile photo (JPG, JPEG, PNG, GIF, max 5MB)',
        },
        skills: { // Define skills as a stringified JSON array
          type: 'string',
          description: 'JSON string of student skills (e.g., "[{"name":"React","yearsOfExperience":3}]")',
          example: '[{"name":"React.js","yearsOfExperience":3}]',
        },
      },
      required: ['userId', 'name', 'registrationNumber', 'course', 'faculty', 'enrollmentYear'],
    },
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Student profile created successfully.', type: CreateStudentDto })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., invalid input, missing required fields, invalid skill data, invalid file type/size)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (not an Admin)' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile() profilePhotoFile: Express.Multer.File, // <--- Get the uploaded file
  ) {
    // If skills are sent as a string (due to multipart/form-data), parse them
    if (typeof createStudentDto.skills === 'string') {
        try {
            createStudentDto.skills = JSON.parse(createStudentDto.skills as string);
        } catch (e) {
            throw new BadRequestException('Skills field must be a valid JSON string.');
        }
    }
    return this.studentsService.create(createStudentDto, profilePhotoFile);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all student profiles' })
  @ApiResponse({ status: 200, description: 'List of student profiles retrieved successfully.', isArray: true, type: CreateStudentDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single student profile by ID' })
  @ApiResponse({ status: 200, description: 'Student profile retrieved successfully.', type: CreateStudentDto })
  @ApiResponse({ status: 404, description: 'Not Found (Student with ID not found)' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('profilePhoto')) // <--- Intercept 'profilePhoto' for updates
  @ApiConsumes('multipart/form-data') // <--- Indicate that the endpoint consumes form-data
  @ApiOperation({ summary: 'Update an existing student profile by ID with an optional new photo (Admin only)' })
  @ApiBody({ // <--- Define the body for Swagger with file upload in mind
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Jane Doe' },
        registrationNumber: { type: 'string', example: 'STU12345' },
        course: { type: 'string', example: 'Computer Science' },
        faculty: { type: 'string', example: 'Engineering' },
        graduated: { type: 'boolean', example: false },
        enrollmentYear: { type: 'number', example: 2020 },
        profilePhoto: { // <--- Define profilePhoto as file type for Swagger
          type: 'string',
          format: 'binary',
          description: 'New student profile photo (JPG, JPEG, PNG, GIF, max 5MB)',
        },
        skills: { // Define skills as a stringified JSON array
          type: 'string',
          description: 'JSON string of student skills (e.g., "[{"id":1,"name":"React","yearsOfExperience":3}]")',
          example: '[{"id":1,"name":"React.js","yearsOfExperience":3}]',
        },
      },
    },
  })

  @ApiResponse({ status: 200, description: 'Student profile updated successfully.', type: CreateStudentDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (not an Admin)' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @UploadedFile() profilePhotoFile: Express.Multer.File, // <--- Get the uploaded file
  ) {
    // If skills are sent as a string (due to multipart/form-data), parse them
    if (typeof updateStudentDto.skills === 'string') {
        try {
            updateStudentDto.skills = JSON.parse(updateStudentDto.skills as string);
        } catch (e) {
            throw new BadRequestException('Skills field must be a valid JSON string.');
        }
    }
    return this.studentsService.update(id, updateStudentDto, profilePhotoFile);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a student profile by ID (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Student profile deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (not an Admin)' })
  @ApiResponse({ status: 404, description: 'Not Found (Student with ID not found)' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }

  // --- Student Skill specific methods remain the same, as they don't involve file uploads directly ---
  @Post(':studentId/skills')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: 'Add a new skill to a student (Admin only)' })
  @ApiBody({ type: CreateStudentSkillDto, description: 'Data for creating a new skill for a student.' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Skill added to student successfully.', type: CreateStudentSkillDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (not an Admin)' })
  @ApiResponse({ status: 404, description: 'Not Found (Student not found)' })
  @ApiResponse({ status: 409, description: 'Conflict (Skill already exists for student)' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  addSkill(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() createStudentSkillDto: CreateStudentSkillDto,
  ) {
    return this.studentsService.addSkillToStudent(studentId, createStudentSkillDto);
  }

  @Patch(':studentId/skills/:skillId')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: 'Update a specific skill for a student (Admin only)' })
  @ApiBody({ type: UpdateStudentSkillDto, description: 'Data for updating an existing skill.' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Student skill updated successfully.', type: CreateStudentSkillDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (not an Admin)' })
  @ApiResponse({ status: 404, description: 'Not Found (Student or Skill not found)' })
  @ApiResponse({ status: 409, description: 'Conflict (New skill name already exists for student)' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  updateSkill(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
    @Body() updateStudentSkillDto: UpdateStudentSkillDto,
  ) {
    return this.studentsService.updateStudentSkill(studentId, skillId, updateStudentSkillDto);
  }

  @Delete(':studentId/skills/:skillId')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a specific skill from a student (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Student skill removed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (not an Admin)' })
  @ApiResponse({ status: 404, description: 'Not Found (Student or Skill not found)' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  removeSkill(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    return this.studentsService.removeStudentSkill(studentId, skillId);
  }
}