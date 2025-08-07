// src/common/interceptors/transform.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { ApiResponseDto } from 'src/students/dto/api-response.dto';

export const EXCLUDE_TRANSFORM_KEY = 'exclude_transform';
export const ExcludeTransform = () => Reflector.createDecorator<boolean>();

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
    constructor(private reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
        const excludeTransform = this.reflector.getAllAndOverride<boolean>(
            EXCLUDE_TRANSFORM_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (excludeTransform) {
            return next.handle();
        }

        return next.handle().pipe(
            map((data) => {
                const ctx = context.switchToHttp();
                const response = ctx.getResponse();
                const request = ctx.getRequest();

                // Don't transform if it's already an error response or specific formats
                if (response.statusCode >= 400 || !data) {
                    return data;
                }

                return {
                    statusCode: response.statusCode || HttpStatus.OK,
                    message: this.getSuccessMessage(request.method, response.statusCode),
                    data,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                };
            }),
        );
    }

    private getSuccessMessage(method: string, statusCode: number): string {
        switch (statusCode) {
            case HttpStatus.CREATED:
                return 'Resource created successfully';
            case HttpStatus.NO_CONTENT:
                return 'Resource deleted successfully';
            default:
                switch (method) {
                    case 'GET':
                        return 'Data retrieved successfully';
                    case 'POST':
                        return 'Resource created successfully';
                    case 'PUT':
                    case 'PATCH':
                        return 'Resource updated successfully';
                    case 'DELETE':
                        return 'Resource deleted successfully';
                    default:
                        return 'Operation completed successfully';
                }
        }
    }
}