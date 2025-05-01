// src/auth/auth.controller.ts
import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import { AuthDto, RefreshDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ValidationPipe } from '@nestjs/common/pipes';

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
}