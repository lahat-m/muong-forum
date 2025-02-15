import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards, Req, UploadedFiles, UseInterceptors, Query,  HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';


@Controller('user')
@ApiTags('user')
export class UserController {
	constructor(private readonly userService: UserService) { }

	@Get()
	// @UseGuards(JwtGuard, AuthorizationGuard)
	// @ApiOperation({ summary: 'Get all users' })
	// @ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'Users found' })
	async findAll() {
		return await this.userService.findAll();
	}


	@Get(':id')
	// @UseGuards(JwtGuard)
	@ApiOperation({ summary: 'Get one user by id' })
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'User found' })
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return await this.userService.findOne(id);
	}

	@Post('create-user')
	@ApiOperation({ summary: 'Create a new user' })
	@ApiBody({ type: CreateUserDto })
	@ApiResponse({ status: 201, description: 'User created' })
	async createUser(@Body() createUserDto: CreateUserDto) {
		return await this.userService.createUser(createUserDto);
	}


}