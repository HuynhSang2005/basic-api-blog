import { UserRole } from "@prisma/client";

// Payload cho Access Token - chứa thông tin đầy đủ của user
export interface TokenPayload {
  userId: number;
  username: string;
  role: UserRole;
}

// Payload cho Refresh Token - chỉ cần thông tin tối thiểu
export interface RefreshTokenPayload {
  userId: number;
  refreshTokenId: number;
}

// Response khi login/register thành công
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}