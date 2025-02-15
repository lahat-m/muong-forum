// src/users/users.service.ts
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

const roundsOfHashing = parseInt(process.env.PASSWORD_HASH_ROUNDS || "10");

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
	) { }


	async findAll() {
		const users = await this.prisma.user.findMany({});

		return users;
	}


	async findOne(id: number) {
		try {
			const user = await this.prisma.user.findFirst({
				where: { id },
			})
			if (!user) {
				throw new NotFoundException('User not found');
			}
			return user;
		} catch {
			throw new NotFoundException('User not found');
		}
	}

	async createUser (data: CreateUserDto) {
		try	{
				const user = await this.prisma.user.create({
				data: {
					...data,
					password: bcrypt.hashSync(data.password, roundsOfHashing),
				},
			});

			return user;
		} catch {
			throw new BadRequestException("User already exists")
		}
	}

}
