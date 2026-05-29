// 
import jwt, { Secret, SignOptions } from "jsonwebtoken";

export function generateToken(payload: object) {
  const secret: Secret = process.env.JWT_SECRET as string;

  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
}