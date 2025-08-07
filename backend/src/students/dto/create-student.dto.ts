// src/students/dto/create-student.dto.ts
import { Type } from 'class-transformer';
import {
    IsNumber,
    IsNotEmpty,
    IsString,
    IsBoolean,
    IsOptional,
    IsUrl,
    IsArray,
    ValidateNested,
    MinLength,
    MaxLength,
    Matches,
    Min,
    Max,
    IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateStudentSkillDto } from './create-student-skill.dto';

export class CreateStudentDto {
    @ApiProperty({
        description: 'ID of the user to create student profile for',
        example: 1,
        type: 'integer',
    })
    @IsNumber({}, { message: 'User ID must be a valid number' })
    @IsInt({ message: 'User ID must be an integer' })
    @Min(1, { message: 'User ID must be greater than 0' })
    @IsNotEmpty({ message: 'User ID is required' })
    @Type(() => Number)
    userId: number;

    @ApiProperty({
        description: 'Full name of the student',
        example: 'Jane Doe',
        minLength: 2,
        maxLength: 100,
    })
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    @Matches(/^[a-zA-Z\s'-]+$/, {
        message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    })
    name: string;

    @ApiProperty({
        description: 'Student registration number',
        example: 'STU12345',
        pattern: '^[A-Z]{3}[0-9]{5}$',
    })
    @IsString({ message: 'Registration number must be a string' })
    @IsNotEmpty({ message: 'Registration number is required' })
    @Matches(/^[A-Z]{3}[0-9]{5}$/, {
        message: 'Registration number must follow format: 3 uppercase letters followed by 5 digits (e.g., STU12345)'
    })
    registrationNumber: string;

    @ApiProperty({
        description: 'Course/program of study',
        example: 'Computer Science',
        minLength: 2,
        maxLength: 100,
    })
    @IsString({ message: 'Course must be a string' })
    @IsNotEmpty({ message: 'Course is required' })
    @MinLength(2, { message: 'Course must be at least 2 characters long' })
    @MaxLength(100, { message: 'Course cannot exceed 100 characters' })
    course: string;

    @ApiProperty({
        description: 'Faculty/department',
        example: 'Engineering',
        minLength: 2,
        maxLength: 100,
    })
    @IsString({ message: 'Faculty must be a string' })
    @IsNotEmpty({ message: 'Faculty is required' })
    @MinLength(2, { message: 'Faculty must be at least 2 characters long' })
    @MaxLength(100, { message: 'Faculty cannot exceed 100 characters' })
    faculty: string;

    @ApiPropertyOptional({
        description: 'Graduation status',
        example: false,
        default: false,
    })
    @IsBoolean({ message: 'Graduated must be a boolean value' })
    @IsOptional()
    @Type(() => Boolean)
    graduated?: boolean = false;

    @ApiProperty({
        description: 'Year of enrollment',
        example: 2020,
        minimum: 1900,
        maximum: new Date().getFullYear() + 1,
    })
    @IsNumber({}, { message: 'Enrollment year must be a valid number' })
    @IsInt({ message: 'Enrollment year must be an integer' })
    @Min(1900, { message: 'Enrollment year cannot be before 1900' })
    @Max(new Date().getFullYear() + 1, {
        message: `Enrollment year cannot be more than ${new Date().getFullYear() + 1}`
    })
    @IsNotEmpty({ message: 'Enrollment year is required' })
    @Type(() => Number)
    enrollmentYear: number;

    @ApiPropertyOptional({
        description: 'URL to student profile photo',
        example: 'https://example.com/photos/student.jpg',
    })
    @IsOptional()
    @IsUrl({}, { message: 'Profile photo must be a valid URL' })
    @MaxLength(500, { message: 'Profile photo URL cannot exceed 500 characters' })
    profilePhoto?: string;

    @ApiPropertyOptional({
        description: 'Array of student skills',
        type: [CreateStudentSkillDto],
        example: [{ name: 'React.js', yearsOfExperience: 3 }],
    })
    @IsOptional()
    @IsArray({ message: 'Skills must be an array' })
    @ValidateNested({ each: true })
    @Type(() => CreateStudentSkillDto)
    skills?: CreateStudentSkillDto[];
}