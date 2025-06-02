import { UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

const CustomZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: ZodError) =>
    new UnprocessableEntityException({
      message: 'Validation failed',
      errors: error.errors.map((issue) => ({
        ...issue,
        field: issue.path.join('.'),
        message: issue.message,
      })),
    }),
});

export default CustomZodValidationPipe;