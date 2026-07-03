//import { use } from "react";
import prisma from "../config/prisma";
import { comparePassword, hashPassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import { error } from "node:console";

export async function loginUser(username: string, password: string) {
  var user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  console.log("user details:", user?.username);
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

  // if (username === "admin" && password === "admin123") {
  const token = generateToken({
    userId: user.id, // 1,
    username: user.username, // "admin",
  });

  return {
    token,
    user: {
      id: user.id, // //1,
      userName: user.username, //"admin",
      fullName: user.fullName, //"Admin User",
    },
  };
  // }
  throw new Error("Invalid credentaials....");

  // return {
  //   token,
  //   user: {
  //     id: user.id,
  //     userName: user.username,
  //     // role: user.role,
  //   },
  // };
  // return {
  //   token,
  //   user: {
  //     id: 1,
  //     userName: 'admin',
  //     // role: user.role,
  //   },
  // };
}

export async function changeUserPassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  var user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  console.log("user details:", user?.username);
  if (!user) {
    throw new Error("User not found");
  }

  const validPassword = await comparePassword(
    currentPassword,
    user.passwordHash,
  );
  if (!validPassword) {
    throw new Error("Invalid current password");
  }

  if (!user.isActive) {
    throw new Error("User disabled");
  }

  // hash new password
  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
    },
  });

  return {
    success: true,
  };
  // }
  throw new Error("Invalid credentaials....");
}
