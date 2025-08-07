// src/students/dto/student-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class UserBasicInfoDto {
    @ApiProperty({ description: 'User ID', example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ description: 'User email', example: 'jane.doe@example.com' })
    @Expose()
    email: string;

    @ApiProperty({ description: 'Username', example: 'jane_doe' })
    @Expose()
    username: string;
}

export class StudentSkillResponseDto {
    @ApiProperty({ description: 'Skill ID', example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ description: 'Skill name', example: 'React.js' })
    @Expose()
    name: string;

    @ApiProperty({ description: 'Years of experience', example: 3 })
    @Expose()
    yearsOfExperience: number;

    @ApiProperty({ description: 'Creation timestamp' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp' })
    @Expose()
    updatedAt: Date;
}

export class StudentResponseDto {
    @ApiProperty({ description: 'Student ID', example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ description: 'Associated user ID', example: 1 })
    @Expose()
    userId: number;

    @ApiProperty({ description: 'Student full name', example: 'Jane Doe' })
    @Expose()
    name: string;

    @ApiProperty({ description: 'Registration number', example: 'STU12345' })
    @Expose()
    registrationNumber: string;

    @ApiProperty({ description: 'Course of study', example: 'Computer Science' })
    @Expose()
    course: string;

    @ApiProperty({ description: 'Faculty', example: 'Engineering' })
    @Expose()
    faculty: string;

    @ApiProperty({ description: 'Graduation status', example: false })
    @Expose()
    graduated: boolean;

    @ApiProperty({ description: 'Enrollment year', example: 2020 })
    @Expose()
    enrollmentYear: number;

    @ApiPropertyOptional({
        description: 'Profile photo URL',
        example: 'https://example.com/photos/student.jpg'
    })
    @Expose()
    profilePhoto?: string;

    @ApiProperty({
        description: 'Student skills',
        type: [StudentSkillResponseDto],
        isArray: true,
    })
    @Expose()
    @Type(() => StudentSkillResponseDto)
    skills: StudentSkillResponseDto[];

    @ApiProperty({
        description: 'Basic user information',
        type: UserBasicInfoDto,
    })
    @Expose()
    @Type(() => UserBasicInfoDto)
    user: UserBasicInfoDto;

    @ApiProperty({ description: 'Creation timestamp' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp' })
    @Expose()
    updatedAt: Date;
}
