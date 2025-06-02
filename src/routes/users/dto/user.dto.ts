import { createZodDto } from "nestjs-zod";
import { 
  UserProfileSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  ChangePasswordResponseSchema
} from "../model/user.model";

export class UserProfileDto extends createZodDto(UserProfileSchema) {}
export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
export class ChangePasswordResponseDto extends createZodDto(ChangePasswordResponseSchema) {}