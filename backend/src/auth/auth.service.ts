// src/auth/auth.service.ts

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const roundsOfHashing = parseInt(process.env.PASSWORD_HASH_ROUNDS || '10');

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (bcrypt.compareSync(password, user.password)) {
            // Remove the password from the user object before returning
            const { password, ...userWithoutPassword } = user;
            return {
                user: userWithoutPassword,
                accessToken: this.jwtService.sign({
                    sub: user.id,
                    email: user.email,
                    role: user.role,
                    type: 'access' // used for validating token type in JwtStrategy
                }),
                refreshToken: this.jwtService.sign(
                    {
                        sub: user.id,
                        email: user.email,
                        role: user.role,
                        type: 'refresh'
                    },
                    { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
                )
            };
        }
        throw new UnauthorizedException('Invalid credentials');
    }

    async refresh(refreshToken: string) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user = await this.prisma.user.findUnique({
            where: { email: payload.email }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Remove the password before generating a new token
        const { password, ...userWithoutPassword } = user;

        return {
            accessToken: this.jwtService.sign({
                sub: user.id,
                email: user.email,
                role: user.role,
                type: 'access'
            })
        };
    }
}
