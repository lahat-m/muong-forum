import { Optional } from "@nestjs/common";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";


export class CreateStudentSkillDto {
  @IsNotEmpty()
    @IsString()
    name: string;

  @IsNotEmpty()
      @IsNumber()
    yearsOfExperience: number;
}