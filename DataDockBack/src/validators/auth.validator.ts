import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3),

  password: z.string().min(6),
});

export const changePwdSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});
