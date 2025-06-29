import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";
import { CreateStudentSkillDto } from "./create-student-skill.dto";


export class CreateStudentDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsString()
        @IsNotEmpty()
    name: string;
    @IsString()
        @IsNotEmpty()
    registrationNumber: string;

    @IsString()
        @IsNotEmpty()
    course: string;


    @IsString()
    @IsNotEmpty()
    faculty: string;
    @IsNumber()
    @IsNotEmpty()
    enrollmentYear: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateStudentSkillDto)
    @IsOptional()
    skills?: CreateStudentSkillDto[];
    graduated: boolean;

    @IsString()
    @IsOptional()
    @IsUrl({}, { message: 'Profile photo must be a valid URL' })
    profilePhoto?: string;
}