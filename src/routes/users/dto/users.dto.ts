import { createZodDto } from "nestjs-zod";
import { 
  UserProfileSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  UserListSchema,
  UpdateUserStatusSchema
} from "../model/user.model";

export class UserProfileDto extends createZodDto(UserProfileSchema) {}

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}

export class UserListDto extends createZodDto(UserListSchema) {}

export class UpdateUserStatusDto extends createZodDto(UpdateUserStatusSchema) {}