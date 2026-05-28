import prisma from "../config/prisma"

import { comparePassword } from "../utils/hash";

import { generateToken } from "../utils/jwt";

export async function loginUser(userName: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      userName,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const validPassword = await comparePassword(password, user.passwordHash);

  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("User disabled");
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
    userName: user.userName,
  });

  return {
    token,
    user: {
      id: user.id,
      userName: user.userName,
      role: user.role,
    },
  };
}
