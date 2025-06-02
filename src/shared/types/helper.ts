import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { randomInt } from "crypto";

export function isUniqueConstraintPrismaError( error: unknown ): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === "P2002";
  
}

export function isNotFoundPrismaError( error: unknown ): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === "P2025";
}

export const generateOTP = () => {
  return String(randomInt(100000, 999999));
}