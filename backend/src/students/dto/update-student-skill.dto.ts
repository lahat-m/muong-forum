// src/students/dto/update-student-skill.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentSkillDto } from './create-student-skill.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateStudentSkillDto extends PartialType(CreateStudentSkillDto) {
  @IsNumber()
  @IsOptional()
  id?: number;
}