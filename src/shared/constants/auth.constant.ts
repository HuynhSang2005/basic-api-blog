
export const REQUEST_USER_KEY = 'user' 

export const AuthType = {
  Bear: 'Bearer',
  None: 'None',
} as const 

export type AuthType = (typeof AuthType)[keyof typeof AuthType]

export const ConditionGuard = {
  And: 'and',
  Or: 'or',
} as const

export type ConditionGuardType = (typeof ConditionGuard)[keyof typeof ConditionGuard]

