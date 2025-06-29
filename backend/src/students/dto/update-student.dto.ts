// src/students/dto/update-student.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateStudentSkillDto } from './update-student-skill.dto'; // Import the UpdateStudentSkillDto

// Omit 'skills' from the base type to avoid type conflict
export class UpdateStudentDto extends PartialType(OmitType(CreateStudentDto, ['skills'] as const)) {
  // Explicitly define the skills array type as UpdateStudentSkillDto[]
  // This tells TypeScript that elements here can have the 'id' property.
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStudentSkillDto) // Ensure class-transformer knows to transform to this type
  @IsOptional()
  skills?: UpdateStudentSkillDto[];
}
