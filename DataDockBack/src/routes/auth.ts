import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../config/prisma";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

// caousing error in request in Postman
// const loginSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
// });
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});

const changePwdSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    const { username, password } = parsed.data;
    //add logic to temp bypass auth for Render deployment
    //     if (username === "admin" && password === "admin123") {
    //   return res.json({
    //     token: "test-token",
    //     user: {
    //       id: 1,
    //       userName: "admin",
    //       fullName: "Admin User",
    //     },
    //   });
    // }
    // uncommented as need to add auth logic to flow or when above code get removed
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        userName: user.username,
        // role: user.role,
      },
      process.env.JWT_SECRET! || "datadock-secret",
      {
        expiresIn: "7d",
      },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        userName: user.username,
        // role: user.role, dont have user.role
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/changepwd", authenticate, async (req, res) => {
  try {
    console.log("========req.body:", req.body);
    const parsed = changePwdSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }
    const { currentPassword, newPassword } = parsed.data;

    // uncommented as need to add auth logic to flow or when above code get removed
    console.log(
      "===========userid from request param is:",
      req.user?.userId,
      req.user?.username,
    );
    const user = await prisma.user.findUnique({
      where: {
        id: req.user?.userId,
      },
    });
    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect.",
      });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        passwordHash: hash,
      },
    });
    return res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
