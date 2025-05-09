import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import { AuthDto, RefreshDto } from './dto/auth.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ValidationPipe } from '@nestjs/common/pipes';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Login' })
    @ApiResponse({ status: 200, description: 'Login successful', type: AuthDto })
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @UseGuards(LocalGuard)
    async login(@Req() req) {
        return req.user;
    }

    @Get('verify-email')
    @ApiOperation({ summary: 'Verify email address' })
    @ApiResponse({ status: 200, description: 'Email successfully verified' })
    async verifyEmail(@Query('token') token: string) {
        await this.authService.verifyEmail(token);
        return { message: "Email successfully verified" };
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @UseGuards(AuthGuard('refresh'))
    async refresh(@Body() refreshDto: RefreshDto) {
        return this.authService.refresh(refreshDto.refreshToken);
    }
    
    @Post('forgot-password')
    @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
    @ApiOperation({ summary: 'Request password reset email' })
    @ApiResponse({ status: 200, description: 'Password reset email sent if account exists' })
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async forgotPassword(@Body() dto: RequestPasswordResetDto) {
        await this.authService.requestPasswordReset(dto.email);
        // Don't reveal if email exists in system for security
        return { 
            message: 'If your email is registered, you will receive instructions to reset your password.'
        };
    }
    
    @Post('reset-password')
    @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
    @ApiOperation({ summary: 'Reset password using token' })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this.authService.resetPassword(dto.token, dto.password);
        return { 
            message: 'Password has been successfully reset. You can now log in with your new password.'
        };
    }
}