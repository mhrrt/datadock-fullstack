import { Request, Response } from "express";

import { loginSchema } from "../validators/auth.validator";

import { loginUser } from "../services/auth.service";

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
