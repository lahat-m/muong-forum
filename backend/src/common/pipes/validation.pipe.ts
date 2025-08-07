// src/common/pipes/validation.pipe.ts
import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        const object = plainToInstance(metatype, value, {
            enableImplicitConversion: true,
            excludeExtraneousValues: false,
        });

        const errors = await validate(object, {
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            skipMissingProperties: false,
        });

        if (errors.length > 0) {
            const messages = this.formatErrors(errors);
            throw new BadRequestException({
                statusCode: 400,
                message: messages,
                error: 'Bad Request',
            });
        }

        return object;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }

    private formatErrors(errors: any[]): string[] {
        return errors.flatMap((error) => {
            if (error.constraints) {
                return Object.values(error.constraints) as string[];
            }
            if (error.children && error.children.length > 0) {
                return this.formatErrors(error.children);
            }
            return [`Invalid value for ${error.property}`];
        });
    }
}
