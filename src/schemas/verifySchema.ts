import { z } from "zod";

export const verifySchema = z
  .string()
  .length(6, { message: "Verification code must be exactly 6 digits" })
  .regex(/^\d{6}$/, { message: "Verification code must contain only numbers" });