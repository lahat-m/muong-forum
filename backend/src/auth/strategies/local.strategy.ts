// src/auth/strategies/local.strategy.ts

import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        // Use email as the username field.
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string): Promise<any> {
        const userWithTokens = await this.authService.validateUser(email, password);
        if (!userWithTokens) {
            throw new UnauthorizedException();
        }
        // Return the whole object containing user, accessToken, and refreshToken.
        return userWithTokens;
    }
}
