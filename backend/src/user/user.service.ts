// src/users/users.service.ts

import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateEventDto } from 'src/event/dto/update-event.dto';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { Prisma, UserRole } from '@prisma/client';
import { MailerService } from 'src/mail/mail.service';
const roundsOfHashing = parseInt(process.env.PASSWORD_HASH_ROUNDS || '10');

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);
	constructor(
		private prisma: PrismaService,
        private mailerService: MailerService
	) { }

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
		// Validate email format
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createUserDto.email)) {
		  throw new BadRequestException('Invalid email format');
		}
	  
		// Validate username format if provided
		if (createUserDto.username && !/^[a-zA-Z0-9_]+$/.test(createUserDto.username)) {
		  throw new BadRequestException('Username contains invalid characters');
		}
	  
		try {
		  // Atomic operation using transaction
		  const result = await this.prisma.$transaction(async (prisma) => {
			// Check for existing user within transaction
			const existingUser = await prisma.user.findFirst({
			  where: {
				OR: [
				  { email: createUserDto.email },
				  { username: createUserDto.username }
				]
			  }
			});
	  
			if (existingUser) {
			  if (existingUser.email === createUserDto.email) {
				throw new ConflictException('Email already registered');
			  }
			  if (existingUser.username === createUserDto.username) {
				throw new ConflictException('Username already taken');
			  }
			}
	  
			// Generate verification token
			const verificationToken = uuidv4();
			const tokenExpiresAt = new Date(
			  Date.now() + parseInt(process.env.EMAIL_TOKEN_EXPIRATION || '86400') * 1000
			);
	  
			// Create user
			const user = await prisma.user.create({
			  data: {
				email: createUserDto.email,
				password: bcrypt.hashSync(createUserDto.password, roundsOfHashing),
				verificationToken,
				tokenExpiresAt,
				role: 'USER',
				firstName: createUserDto.firstName,
				lastName: createUserDto.lastName,
				username: createUserDto.username,
			  }
			});
	  
			return user;
		  });
	  
		  // Send verification email outside transaction
		  await this.mailerService.sendVerificationEmail(result.email, result.verificationToken);
		  
		  return { 
			message: "Registration successful. Check your email to verify your account",
			email: result.email
		  };
	  
		} catch (error) {
		  // Handle known Prisma errors
		  if (error instanceof Prisma.PrismaClientKnownRequestError) {
			switch (error.code) {
			  case 'P2002':
				const field = error.meta?.target?.[0] || 'field';
				throw new ConflictException(`${field} already exists`);
			  case 'P2003':
				throw new BadRequestException('Invalid data relation');
			  default:
				this.logger.error(`Database error: ${error.message}`);
				throw new InternalServerErrorException('Registration failed');
			}
		  }
		  
		  // Handle custom business logic errors
		  if (error instanceof ConflictException || error instanceof BadRequestException) {
			throw error;
		  }
	  
		  // Log unexpected errors
		  this.logger.error(`Unexpected registration error: ${error.message}`);
		  throw new InternalServerErrorException('Registration failed');
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


	async findByVerificationToken(token: string) {
        return this.prisma.user.findUnique({
            where: { verificationToken: token },
        });
    }

    async update(id: number, data: Prisma.UserUpdateInput) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
	

	async updateProfile(id: number, updateUserDto: UpdateEventDto) {
		try {
			const updatedUser = await this.prisma.user.update({
				where: {
					id
				},
				data: updateUserDto,
			});
			return updatedUser;
		} catch (error) {
			throw new BadRequestException('Failed to update use profile');
		}
	}


	// delete current user profile
	async deleteProfile(id: number) {
		try {
			const deletedUser = await this.prisma.user.delete({
				where: { id },
			});
			return deletedUser;
		} catch (error) {
			throw new BadRequestException('Failed to delete user profile')
		}
	}
}
