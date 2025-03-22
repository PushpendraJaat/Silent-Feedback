import * as z from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .nonempty("Email/Username is required") // ensures not empty
    .min(3, "Email/Username must be at least 3 characters"),
  password: z
    .string()
    .nonempty("Password is required") // ensures not empty
    .min(6, "Password must be at least 6 characters"),
});
