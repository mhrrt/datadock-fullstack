import { Request, Response } from "express";

import { loginSchema, changePwdSchema } from "../validators/auth.validator";

import { loginUser, changeUserPassword } from "../services/auth.service";

export async function login(req: Request, res: Response) {
  try {
    const validated = loginSchema.parse(req.body);

    const result = await loginUser(validated.username, validated.password);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(401).json({
      message: error.message,
    });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const validated = changePwdSchema.parse(req.body);
    const updateUserId = req.user?.userId ?? 0;
    const result = await changeUserPassword(
      updateUserId,
      validated.currentPassword,
      validated.newPassword,
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(401).json({
      message: error.message,
    });
  }
}
