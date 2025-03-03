import { ApiProperty } from "@nestjs/swagger";
export class CreateParticipantDto {
    @ApiProperty({ example: 'John Doe', description: 'The name of the participant' })
    name: string;

    @ApiProperty({ example: 'email of the participants', description: 'The email of the participant' })
    email: string;

    @ApiProperty({ example: '08012345678', description: 'The phone number of the participant' })
    phone: string;

    @ApiProperty({ example: 'Male', description: 'The Sex of the participant' })
    sex: string;
}
