// src/users/users.service.ts

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

const roundsOfHashing = parseInt(process.env.PASSWORD_HASH_ROUNDS || '10');

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) { }

	async findAll() {
		return await this.prisma.user.findMany({});
	}

	async findOne(id: number) {
		const user = await this.prisma.user.findFirst({
			where: { id },
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	// Create a regular user; role is forced to USER.
	async createUser(createUserDto: CreateUserDto) {
		try {
			const userData = {
				...createUserDto,
				role: 'USER', // Force role to USER
				password: bcrypt.hashSync(createUserDto.password, roundsOfHashing),
			} as any;
			const user = await this.prisma.user.create({
				data: userData,
			});
			return user;
		} catch (error) {
			throw new BadRequestException('User already exists or invalid data provided');
		}
	}
	// Create an admin user. This should be behind proper authentication/guard.
	async createAdmin(createUserDto: CreateUserDto) {
		try {
			const adminData = {
				...createUserDto,
				role: 'ADMIN', // Force role to ADMIN
				password: bcrypt.hashSync(createUserDto.password, roundsOfHashing),
			} as any;
			const admin = await this.prisma.user.create({
				data: adminData,
			});
			return admin;
		} catch (error) {
			throw new BadRequestException('Admin already exists or invalid data provided');
		}
	}
}
