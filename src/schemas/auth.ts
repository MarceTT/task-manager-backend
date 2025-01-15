import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({
      message: "Email is required",
    })
    .email("Invalid email"),
  password: z
    .string({
      message: "Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must be at most 30 characters"),
});

export const registerSchema = z.object({
  firstName: z
    .string({
      message: "First name is required",
    })
    .min(3, "First name must be at least 3 characters")
    .max(30, "First name must be at most 30 characters"),
  lastName: z
    .string({
      message: "Last name is required",
    })
    .min(3, "Last name must be at least 3 characters")
    .max(30, "Last name must be at most 30 characters"),
  email: z
    .string({
      message: "Email is required",
    })
    .email("Invalid email"),
  password: z
    .string({
      message: "Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must be at most 30 characters"),
  profilePicture: z.string().optional(),
  isEnable: z.boolean().optional(),
  isVerified: z.boolean().default(false),
});
