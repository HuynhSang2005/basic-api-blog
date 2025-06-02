import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodSerializationException } from 'nestjs-zod';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();
      this.logger.error(`ZodSerializationException: ${zodError.message}`);
    }

    const exceptionResponse = exception.getResponse();

    // Format lại response cho validation errors
    if (
      status === HttpStatus.BAD_REQUEST &&
      typeof exceptionResponse === 'object'
    ) {
      const errorResponse = exceptionResponse as any;

      // Nếu có details (từ CustomZodValidationPipe)
      if (errorResponse.details) {
        return response.status(status).json({
          statusCode: status,
          message: errorResponse.message || 'Validation failed',
          error: 'Bad Request',
          timestamp: new Date().toISOString(),
          validation_errors: errorResponse.details,
        });
      }
    }

    // Format response cho các lỗi khác
    const errorResponse = {
      statusCode: status,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message,
      error: HttpStatus[status],
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      `HTTP Exception: ${status} - ${errorResponse.message}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}
