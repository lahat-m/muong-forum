// src/users/users.controller.ts

import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req, Delete, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UpdateEventDto } from 'src/event/dto/update-event.dto';

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

	@Get('profile')
	@UseGuards(JwtGuard)
	@ApiOperation({ summary: "Get current user profile " })
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: "User profile retrieved" })
	async getProfile(@Req() req) {
		const user = req.user;
		return await this.userService.findOne(user.id);
	}


	@Patch('update-profile')
	@UseGuards(JwtGuard)
	@ApiOperation({ summary: "Update current user profile" })
	@ApiBearerAuth()
	@ApiBody({ type: UpdateEventDto })
	@ApiResponse({ status: 200, description: "User prfole updated" })
	async updateProfile(@Req() req, @Body() updateUserDto: UpdateEventDto) {
		const user = req.user;
		return await this.userService.updateProfile(user.id, updateUserDto);
		}

	@Delete('delete-profile')
	@UseGuards(JwtGuard)
	@ApiOperation({ summary: "Delete current user profile" })
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: "User profile deleted" })
	async deleteProfile(@Req() req) {
		const user = req.user;
		return await this.userService.deleteProfile(user.id)
	}
}
