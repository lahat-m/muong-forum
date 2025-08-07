// src/common/dto/api-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
    @ApiProperty({ description: 'HTTP status code', example: 200 })
    statusCode: number;

    @ApiProperty({ description: 'Response message', example: 'Success' })
    message: string;

    @ApiPropertyOptional({ description: 'Response data' })
    data?: T;

    @ApiPropertyOptional({ description: 'Timestamp of the response' })
    timestamp?: string;

    @ApiPropertyOptional({ description: 'Request path' })
    path?: string;
}

export class ErrorResponseDto {
    @ApiProperty({ description: 'HTTP status code', example: 400 })
    statusCode: number;

    @ApiProperty({
        description: 'Error message(s)',
        oneOf: [
            { type: 'string', example: 'Invalid input data' },
            { type: 'array', items: { type: 'string' }, example: ['Name is required', 'Invalid email format'] }
        ]
    })
    message: string | string[];

    @ApiProperty({ description: 'Error type', example: 'Bad Request' })
    error: string;

    @ApiPropertyOptional({ description: 'Timestamp of the error' })
    timestamp?: string;

    @ApiPropertyOptional({ description: 'Request path' })
    path?: string;
}