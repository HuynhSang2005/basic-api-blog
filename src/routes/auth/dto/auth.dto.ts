import { createZodDto } from "nestjs-zod";
import { 
  RegisterBodySchema, 
  RegisterResponseSchema,
  LoginBodySchema,
  LoginResponseSchema,
  RefreshTokenBodySchema,
  RefreshTokenResponseSchema,
  LogoutBodySchema
} from "../model/auth.model";

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}

export class LoginBodyDto extends createZodDto(LoginBodySchema) {}
export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}

export class RefreshTokenBodyDto extends createZodDto(RefreshTokenBodySchema) {}
export class RefreshTokenResponseDto extends createZodDto(RefreshTokenResponseSchema) {}

export class LogoutBodyDto extends createZodDto(LogoutBodySchema) {}