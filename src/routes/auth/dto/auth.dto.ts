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

// Register DTOs
export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}

// Login DTOs  
export class LoginBodyDto extends createZodDto(LoginBodySchema) {}
export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}

// Refresh Token DTOs
export class RefreshTokenBodyDto extends createZodDto(RefreshTokenBodySchema) {}
export class RefreshTokenResponseDto extends createZodDto(RefreshTokenResponseSchema) {}

// Logout DTO
export class LogoutBodyDto extends createZodDto(LogoutBodySchema) {}