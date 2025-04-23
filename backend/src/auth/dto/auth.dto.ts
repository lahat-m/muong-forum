import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class AuthDto {

    @IsEmail()
    @ApiProperty({ example: 'test@gmail.com', description: 'The email of the user' })
    email!: string;

    @IsString()
    @ApiProperty({example: 'password', description: 'The password of the user'})
    password!: string;
}

export class RefreshDto {
    @IsString()
    @ApiProperty()
    refreshToken!: string;
}
