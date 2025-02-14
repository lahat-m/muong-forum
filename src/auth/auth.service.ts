import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service"
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
            where: {
                email: email
            }
        });

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (bcrypt.compareSync(password, user.password)) {
            delete user.password;
            return {
                user,
                accessToken: this.jwtService.sign({ ...user, type: 'access' }),
                refreshToken: this.jwtService.sign({ ...user, type: 'refresh' }, { expiresIn: process.env.JWT_REFRESH_EXPIRATION }),
            }
            // return result;
        }

        throw new UnauthorizedException("Invalid credentials");
    }

    async refresh(refreshToken: string) {
        const payload = this.jwtService.verify(refreshToken);

        const user = await this.prisma.user.findUnique({
            where: {
                email: payload.email
            }
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        delete user.password;
        return {
            accessToken: this.jwtService.sign({ ...user, type: 'access' }),
        }
    }

}