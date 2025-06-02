import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError, ZodIssue } from 'zod';

const CustomZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) => {
    const formattedErrors = error.errors.map((issue: ZodIssue) => {
      const field = issue.path.length > 0 ? issue.path.join('.') : 'body';
      const value = 'received' in issue ? issue.received : null;
      
      return {
        field: field,
        message: issue.message,
        code: issue.code,
        value: value,
        path: issue.path,
      };
    });

    return new BadRequestException({
      message: 'Dữ liệu không hợp lệ',
      statusCode: 400,
      error: 'Bad Request',
      details: formattedErrors,
    });
  },
});

export default CustomZodValidationPipe;