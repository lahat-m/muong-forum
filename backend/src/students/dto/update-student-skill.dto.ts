// src/students/dto/update-student-skill.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentSkillDto } from './create-student-skill.dto';
import { IsNumber, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentSkillDto extends PartialType(CreateStudentSkillDto) {
  @ApiPropertyOptional({
    description: 'ID of the skill (for updates)',
    example: 1,
    type: 'integer',
  })
  @IsNumber({}, { message: 'Skill ID must be a valid number' })
  @IsInt({ message: 'Skill ID must be an integer' })
  @Min(1, { message: 'Skill ID must be greater than 0' })
  @IsOptional()
  @Type(() => Number)
  id?: number;
}
