// src/users/dto/create-user.dto.ts

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional() // Username is optional if you want to allow email-only registration
    username?: string;
}