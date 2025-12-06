import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .pipe(z.email("Please enter a valid email address"));

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newEmail: emailSchema.optional().or(z.literal("")),
    newPassword: passwordSchema.optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      return data.newEmail || data.newPassword;
    },
    {
      message: "Please provide a new email or password to update",
      path: ["root"],
    }
  );
