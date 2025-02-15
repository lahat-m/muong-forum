import { UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh'){

    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any){
        
        if (payload.type !== 'refresh') {
            throw new UnauthorizedException("Invalid token type");
        }
        return { user: payload.user };
    }
}