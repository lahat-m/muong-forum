// src/students/dto/student-query.dto.ts
import {
    IsOptional,
    IsString,
    IsBoolean,
    IsInt,
    Min,
    Max,
    MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StudentQueryDto {
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
        default: 1,
    })
    @IsOptional()
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be at least 1' })
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
    })
    @IsOptional()
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be at least 1' })
    @Max(100, { message: 'Limit cannot exceed 100' })
    @Type(() => Number)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Search term for name or registration number',
        example: 'Jane Doe',
        maxLength: 100,
    })
    @IsOptional()
    @IsString({ message: 'Search term must be a string' })
    @MaxLength(100, { message: 'Search term cannot exceed 100 characters' })
    search?: string;

    @ApiPropertyOptional({
        description: 'Filter by course',
        example: 'Computer Science',
        maxLength: 100,
    })
    @IsOptional()
    @IsString({ message: 'Course filter must be a string' })
    @MaxLength(100, { message: 'Course filter cannot exceed 100 characters' })
    course?: string;

    @ApiPropertyOptional({
        description: 'Filter by faculty',
        example: 'Engineering',
        maxLength: 100,
    })
    @IsOptional()
    @IsString({ message: 'Faculty filter must be a string' })
    @MaxLength(100, { message: 'Faculty filter cannot exceed 100 characters' })
    faculty?: string;

    @ApiPropertyOptional({
        description: 'Filter by graduation status',
        example: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'Graduated filter must be a boolean' })
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    graduated?: boolean;

    @ApiPropertyOptional({
        description: 'Sort field',
        example: 'name',
        enum: ['name', 'registrationNumber', 'course', 'faculty', 'enrollmentYear', 'createdAt'],
    })
    @IsOptional()
    @IsString({ message: 'Sort field must be a string' })
    sortBy?: 'name' | 'registrationNumber' | 'course' | 'faculty' | 'enrollmentYear' | 'createdAt' = 'createdAt';

    @ApiPropertyOptional({
        description: 'Sort order',
        example: 'desc',
        enum: ['asc', 'desc'],
    })
    @IsOptional()
    @IsString({ message: 'Sort order must be a string' })
    sortOrder?: 'asc' | 'desc' = 'desc';
}