// src/common/filters/http-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from 'src/students/dto/api-response.dto';
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = this.getStatus(exception);
        const message = this.getMessage(exception);
        const error = this.getError(exception, status);

        const errorResponse: ErrorResponseDto = {
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        // Log error details
        this.logger.error(
            `${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`,
            exception instanceof Error ? exception.stack : undefined,
        );

        response.status(status).json(errorResponse);
    }

    private getStatus(exception: unknown): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private getMessage(exception: unknown): string | string[] {
        if (exception instanceof HttpException) {
            const response = exception.getResponse();
            if (typeof response === 'object' && 'message' in response) {
                return (response as any).message;
            }
            return response as string;
        }
        return 'Internal server error';
    }

    private getError(exception: unknown, status: number): string {
        if (exception instanceof HttpException) {
            return exception.constructor.name.replace('Exception', '').replace(/([A-Z])/g, ' $1').trim();
        }

        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return 'Bad Request';
            case HttpStatus.UNAUTHORIZED:
                return 'Unauthorized';
            case HttpStatus.FORBIDDEN:
                return 'Forbidden';
            case HttpStatus.NOT_FOUND:
                return 'Not Found';
            case HttpStatus.CONFLICT:
                return 'Conflict';
            case HttpStatus.UNPROCESSABLE_ENTITY:
                return 'Unprocessable Entity';
            case HttpStatus.TOO_MANY_REQUESTS:
                return 'Too Many Requests';
            default:
                return 'Internal Server Error';
        }
    }
}
