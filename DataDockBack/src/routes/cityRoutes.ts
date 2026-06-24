import express from "express";
import prisma from "../config/prisma";
console.log("City routes loaded");
const router = express.Router();

// adding option to search and load city names as user start with keypress
router.get("/search", async (req, res) => {
  try {
    const searchTerm = String(req.query.q || "").trim();

    if (searchTerm.length < 1) {
      return res.json([]);
    }

    const cities = await prisma.city.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      include: {
        state: true,
      },
      orderBy: {
        name: "asc",
      },
      take: 20,
    });

    res.json(cities);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to search cities",
    });
  }
});

// search city with respective stateID
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
