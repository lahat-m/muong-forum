// src/students/dto/update-student.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateStudentSkillDto } from './update-student-skill.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentDto extends PartialType(OmitType(CreateStudentDto, ['skills'] as const)) {
  @ApiPropertyOptional({
    description: 'Array of student skills with optional IDs for updates',
    type: [UpdateStudentSkillDto],
    example: [{ id: 1, name: 'React.js', yearsOfExperience: 4 }],
  })
  @IsArray({ message: 'Skills must be an array' })
  @ValidateNested({ each: true })
  @Type(() => UpdateStudentSkillDto)
  @IsOptional()
  skills?: UpdateStudentSkillDto[];
}