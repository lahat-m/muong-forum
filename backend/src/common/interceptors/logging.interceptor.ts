// src/common/interceptors/logging.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const { method, url, ip } = request;
        const userAgent = request.get('User-Agent') || '';
        const startTime = Date.now();

        this.logger.log(`${method} ${url} - ${ip} - ${userAgent}`);

        return next.handle().pipe(
            tap(() => {
                const { statusCode } = response;
                const contentLength = response.get('content-length') || 0;
                const responseTime = Date.now() - startTime;

                this.logger.log(
                    `${method} ${url} ${statusCode} ${contentLength} - ${responseTime}ms - ${ip} - ${userAgent}`,
                );
            }),
            catchError((error) => {
                const { statusCode = 500 } = error;
                const responseTime = Date.now() - startTime;

                this.logger.error(
                    `${method} ${url} ${statusCode} - ${responseTime}ms - ${ip} - ${userAgent} - Error: ${error.message}`,
                );

                throw error;
            }),
        );
    }
}