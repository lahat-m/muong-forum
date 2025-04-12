// src/users/users.controller.ts

import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('user')
@ApiTags('user')
export class UserController {
	constructor(private readonly userService: UserService) { }

	@Get()
	@ApiResponse({ status: 200, description: 'Users found' })
	async findAll() {
		return await this.userService.findAll();
	}

	@Get(':id')
	@UseGuards(JwtGuard)
	@ApiOperation({ summary: 'Get user by id' })
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'User found' })
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return await this.userService.findOne(id);
	}

	// Public endpoint for creating a regular user.
	@Post('create-user')
	@ApiOperation({ summary: 'Create a new user' })
	@ApiBody({ type: CreateUserDto })
	@ApiResponse({ status: 201, description: 'User created' })
	async createUser(@Body() createUserDto: CreateUserDto) {
		return await this.userService.createUser(createUserDto);
	}

	// Protected endpoint for creating an admin user.
	@Post('create-admin')
	@UseGuards(JwtGuard, AdminGuard)
	@ApiOperation({ summary: 'Create an admin user' })
	@ApiBody({ type: CreateUserDto })
	@ApiResponse({ status: 201, description: 'Admin user created' })
	async createAdmin(@Body() createUserDto: CreateUserDto) {
		return await this.userService.createAdmin(createUserDto);
	}
}
