export interface TokenPayload {
  userId: number;
  // iat: number;
  // exp: number;
}
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
} 