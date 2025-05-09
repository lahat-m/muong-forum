// src/auth/auth.service.ts

import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { MailerService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';

const roundsOfHashing = parseInt(process.env.PASSWORD_HASH_ROUNDS || '10');

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private userService: UserService,
        private mailerService: MailerService
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email }
        });
    
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
    
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
    
        if (!user.isEmailVerified && user.role !== 'ADMIN') {
            throw new UnauthorizedException('Email not verified. Please check your email for verification instructions.');
        }
    
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken: this.jwtService.sign({
                sub: user.id,
                email: user.email,git
                },
                { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') }
            )
        };
    }

    // Email verification logic
    async verifyEmail(token: string): Promise<void> {
        // Find the email verification record
        const verification = await this.prisma.emailVerification.findUnique({
            where: { token },
            include: { user: true }
        });
        
        if (!verification) {
            throw new NotFoundException('Invalid verification token');
        }
        
        if (verification.expiresAt < new Date()) {
            throw new BadRequestException('Verification token has expired');
        }
        
        // Update the user and clean up the verification token
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: verification.userId },
                data: { isEmailVerified: true }
            }),
            this.prisma.emailVerification.delete({
                where: { id: verification.id }
            })
        ]);
    }
    
    // Password reset functionality
    async requestPasswordReset(email: string): Promise<void> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            
            if (!user) {
                // Silently return to prevent email enumeration
                return;
            }
            
            // Generate a random token
            const plainToken = crypto.randomBytes(32).toString('hex');
            // Hash the token for storage
            const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
            
            // Set expiration (1 hour from now)
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
            
            // Delete any existing reset tokens for this user
            await this.prisma.passwordResetToken.deleteMany({
                where: { userId: user.id }
            });
            
            // Create a new reset token
            await this.prisma.passwordResetToken.create({
                data: {
                    userId: user.id,
                    tokenHash,
                    expiresAt
                }
            });
            
            // Create the reset URL with the plain token
            const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${plainToken}`;
            
            // Calculate expiry time in minutes for the email
            const expiryTimeInMinutes = 60; // 1 hour
            
            // Send the email
            await this.mailerService.sendPasswordResetEmail(
                user.email,
                resetUrl,
                expiryTimeInMinutes
            );
            
            // Create an audit log entry
            await this.prisma.auditLog.create({
                data: {
                    action: 'PASSWORD_RESET_REQUESTED',
                    userId: user.id.toString(),
                    metaData: { email: user.email }
                }
            });
            
        } catch (error) {
            // Log the error but don't expose details to the client
            console.error('Password reset request error:', error);
            
            // Create an audit log for the error
            try {
                await this.prisma.auditLog.create({
                    data: {
                        action: 'PASSWORD_RESET_REQUEST_ERROR',
                        metaData: { error: error.message }
                    }
                });
            } catch (logError) {
                console.error('Failed to log audit record:', logError);
            }
        }
    }
    
    async resetPassword(token: string, newPassword: string): Promise<void> {
        // Hash the provided token to match against stored hash
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        
        // Find the token record
        const resetToken = await this.prisma.passwordResetToken.findFirst({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: { gt: new Date() }
            },
            include: { user: true }
        });
        
        if (!resetToken) {
            throw new NotFoundException('Invalid or expired reset token');
        }
        
        // Hash the new password
        const hashedPassword = bcrypt.hashSync(newPassword, roundsOfHashing);
        
        // Update password and mark token as used in a transaction
        await this.prisma.$transaction([
            // Update the user's password
            this.prisma.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword }
            }),
            
            // Mark the token as used
            this.prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() }
            }),
            
            // Create an audit log entry
            this.prisma.auditLog.create({
                data: {
                    action: 'PASSWORD_RESET_COMPLETED',
                    userId: resetToken.userId.toString(),
                    metaData: { email: resetToken.user.email }
                }
            })
        ]);
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


    async resendVerificationEmail(email: string): Promise<void> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            
            if (!user) {
                // Silently return to prevent email enumeration
                return;
            }
            
            // If user is already verified, no need to send another email
            if (user.isEmailVerified) {
                return;
            }
            
            // Delete any existing verification records
            await this.prisma.emailVerification.deleteMany({
                where: { userId: user.id }
            });
            
            // Generate new verification token
            const token = uuidv4();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry
            
            // Create new verification record
            await this.prisma.emailVerification.create({
                data: {
                    userId: user.id,
                    token,
                    expiresAt
                }
            });
            
            // Send verification email
            await this.mailerService.sendVerificationEmail(user.email, token);
            
            // Log the action
            await this.prisma.auditLog.create({
                data: {
                    action: 'VERIFICATION_EMAIL_RESENT',
                    userId: user.id.toString(),
                    metaData: { email: user.email }
                }
            });
        } catch (error) {
            console.error('Failed to resend verification email:', error);
        }
}
}