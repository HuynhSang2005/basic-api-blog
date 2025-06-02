import { SetMetadata } from "@nestjs/common";
import { AuthType, ConditionGuard, ConditionGuardType } from "src/shared/constants/auth.constant";

export const AUTH_TYPE = 'authType';

export type AuthTypeDecoratorPayLoad = {
  authType: AuthType[];
  options: { condition: ConditionGuardType };
}

export const Auth = (authType: AuthType[], options?: { condition: ConditionGuardType }) => {
  return SetMetadata(AUTH_TYPE, { authType, options: options?? {condition: ConditionGuard.And} });
}