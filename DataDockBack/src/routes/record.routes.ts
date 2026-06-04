// import { Router } from "express";
// import { PrismaClient } from "@prisma/client/extension";
// import { date } from "zod";

// const router = Router();
// const prisma = new PrismaClient();

// router.post("/", async(req, res) => {
//     const record = await prisma.record.create({
//         data: req.body,
//     });

//     res.json(record);
// });

// router.get("/", async (__dirname, res) => {
//     const records = await prisma.record.findMany({
//         orderBy: {
//             createdAt: "desc",
//         },
//     });

//     res.json(records);
// });

import { Router } from "express";
import {
  getRecords,
  createRecord,
  getRecordById,
  updateRecord,
} from "../controllers/record.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// router.get("/", getRecords);
// router.get("/", authenticate, getRecords);
router.get("/", getRecords);
router.post("/", createRecord);
router.get("/:id", getRecordById);
router.put("/:id", updateRecord);

export default router;
