import express from "express";
import prisma from "../config/prisma";
console.log("City routes loaded");
const router = express.Router();

router.get("/:stateId", async (req, res) => {
  try {
    console.log("Cities API hit");
    const stateId = Number(req.params.stateId);

    const cities = await prisma.city.findMany({
      where: {
        stateId,
      },

      orderBy: {
        name: "asc",
      },
    });

    res.json(cities);
  } catch (error) {
    console.error(error);
    console.log("Cities API hit...error", error);
    res.status(500).json({
      error: "Failed to fetch cities",
    });
  }
});

export default router;
