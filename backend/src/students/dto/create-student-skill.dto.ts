// src/students / dto / create - student - skill.dto.ts
import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  Min,
  Max,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentSkillDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'React.js',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'Skill name must be a string' })
  @IsNotEmpty({ message: 'Skill name is required' })
  @MinLength(1, { message: 'Skill name cannot be empty' })
  @MaxLength(50, { message: 'Skill name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z0-9\s.+-/#&()]+$/, {
    message: 'Skill name contains invalid characters'
  })
  name: string;

  @ApiProperty({
    description: 'Years of experience with this skill',
    example: 3,
    minimum: 0,
    maximum: 50,
    type: 'number',
  })
  @IsNumber({}, { message: 'Years of experience must be a valid number' })
  @Min(0, { message: 'Years of experience cannot be negative' })
  @Max(50, { message: 'Years of experience cannot exceed 50 years' })
  @IsNotEmpty({ message: 'Years of experience is required' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = parseFloat(value);
      if (isNaN(num)) {
        throw new Error('Years of experience must be a valid number');
      }
      return num;
    }
    return value;
  })
  @Type(() => Number)
  yearsOfExperience: number;
}
