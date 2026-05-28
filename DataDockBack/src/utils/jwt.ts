import jwt from "jsonwebtoken";

export function generateToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}
