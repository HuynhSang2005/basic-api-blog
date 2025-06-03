import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
  ApiTags,
} from '@nestjs/swagger';

interface ApiOperationDecoratorOptions {
  type?: any;
  summary: string;
  description: string;
  operationId: string;
  tags?: string[];
  requireAuth?: boolean;
  isArray?: boolean; 
}

export function ApiOperationDecorator({
  type,
  summary,
  description,
  operationId,
  tags = [],
  requireAuth = false,
  isArray = false,
}: ApiOperationDecoratorOptions) {
  const decorators = [
    ApiOperation({ summary, operationId }),
    ApiOkResponse({
      type,
      description,
      isArray, 
    }),
    ApiBadRequestResponse({ description: 'Invalid request data' }),
    ApiUnprocessableEntityResponse({ description: 'Validation failed' }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error, please try later',
    }),
  ];

  if (requireAuth) {
    decorators.push(
      ApiBearerAuth('JWT-auth'),
      ApiUnauthorizedResponse({ description: 'Invalid or missing token' }),
      ApiForbiddenResponse({ description: 'Insufficient permissions' })
    );
  }

  // ← Thêm tags nếu có
  if (tags.length > 0) {
    decorators.push(ApiTags(...tags));
  }

  return applyDecorators(...decorators);
}