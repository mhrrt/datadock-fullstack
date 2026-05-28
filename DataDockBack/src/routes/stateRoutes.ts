import express from "express";
// import { PrismaClient } from "@prisma/client";
import prisma from "../config/prisma";

const router = express.Router();

//onst prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(states);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch states",
    });
  }
});

export default router;