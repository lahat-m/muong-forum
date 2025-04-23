import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, isPositive, IsString } from "class-validator";
export class CreateParticipantDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'John Doe', description: 'The name of the participant' })
    name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'email of the participants', description: 'The email of the participant' })
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: '0123456789', description: 'The phone number of the participant' })
    phone: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Male', description: 'The Sex of the participant' })
    sex: string;

    @IsNumber()
    @ApiProperty({ example: 'Id', description: 'The id of the participant' })
    eventId: number;
}
