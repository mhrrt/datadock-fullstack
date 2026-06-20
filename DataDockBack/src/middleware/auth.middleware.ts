import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("auth middelware hit");
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("returning from middelware for 401");
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1] as string;

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
      username: string;
    };

    console.log("TOKEN:", token);
    console.log("DECODED:", decoded);

    // req.user = decoded;
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}
