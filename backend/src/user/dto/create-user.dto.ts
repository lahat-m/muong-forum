import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ example: 'james@mail.com' })
    email: string;
  
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'james' })
    username: string;
  
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @ApiProperty({ example: 'password' })
    password: string;
  
    @IsString()
    @ApiProperty({ example: 'James'})
    firstName?: string;
  
    @IsString()
    @ApiProperty({ example: 'Doe'})
    lastName?: string;

}
