import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';

import { ValidationError } from 'class-validator';

const nestedErrors = (
  error: ValidationError,
  errorsResponse: Record<string, any>,
) => {
  if (error.children && error.children.length > 0) {
    error.children.forEach((childError) => {
      nestedErrors(childError, errorsResponse);
    });
  } else {
    if (error.constraints) {
      errorsResponse[error.property] = Object.values(error.constraints);
    }
  }
};

export const customValidationPipe = new ValidationPipe({
  stopAtFirstError: true,
  exceptionFactory(errors) {
    const errorsResponse = {};
    errors.forEach((error) => {
      nestedErrors(error, errorsResponse);
    });
    return new BadRequestException({
      message: 'Validation failed',
      errors: errorsResponse,
      status: HttpStatus.BAD_REQUEST,
    });
  },
});
