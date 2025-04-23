// src/auth/auth.controller.ts

import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthDto, RefreshDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

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
        // req.user is set by the local strategy guard; it contains { user, accessToken, refreshToken }
        return req.user;
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @UseGuards(AuthGuard('refresh')) // assuming you have a refresh strategy registered as 'refresh'
    async refresh(@Body() refreshDto: RefreshDto) {
        return this.authService.refresh(refreshDto.refreshToken);
    }
}
