import express from "express";
import prisma from "../config/prisma";
console.log("Pincode routes loaded");

const router = express.Router();

router.get("/:cityId", async (req, res) => {
  try {
        console.log("Pincode API hit");

    const cityId = Number(req.params.cityId);

    const pincodes = await prisma.pincode.findMany({
      where: {
        cityId,
      },

      orderBy: {
        id: "asc",
      },
    });

    res.json(pincodes);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch pincodes",
    });
  }
});

export default router;
