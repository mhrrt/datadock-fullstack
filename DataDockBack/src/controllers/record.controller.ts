import { Request, Response } from "express";
import { searchRecordSchema } from "../validators/record.validator";
import { searchRecords } from "../services/record.service";
import prisma from "../config/prisma";

// ==========================================
// GET RECORDS
// ==========================================

export async function getRecords(req: Request, res: Response) {
  // {
  //   try {
  //     const validated = searchRecordSchema.parse(req.query);
  //     const result = await searchRecords(validated);

  //     return res.status(200).json(result);
  //   } catch (error: any) {
  //     return res.status(400).json({
  //       message: error.message || "Invalid request",
  //     });
  //   }
  // }
  try {
    const records = await prisma.customer.findMany({
      include: {
        state: true,
        city: true,
        pincode: true,
        createdBy: true,
      },

      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return res
      .status(200)
      .json(
        JSON.parse(
          JSON.stringify(records, (_, value) =>
            typeof value === "bigint" ? value.toString() : value,
          ),
        ),
      );
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message || "Failed to fetch records",
    });
  }
}

export async function getRecordById(req: Request, res: Response) {
  try {
    const records = await prisma.customer.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!records) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    return res
      .status(200)
      .json(
        JSON.parse(
          JSON.stringify(records, (_, value) =>
            typeof value === "bigint" ? value.toString() : value,
          ),
        ),
      );
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message || "Failed to fetch selected record",
    });
  }
}

function serializeBigInt(data: any) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}
// ==========================================
// CREATE RECORD
// ==========================================

export async function createRecord(req: Request, res: Response) {
  console.log("===== CREATE =====");
  console.log("TIME:", new Date().toISOString());
  console.log("BODY:", req.body);
  try {
    const { stateId, cityId, ...customerData } = req.body;

    const record = await prisma.customer.create({
      data: {
        ...customerData,

        stateId: stateId ? Number(stateId) : null,
        cityId: cityId ? Number(cityId) : null,

        pincodeId: customerData.pincodeId
          ? Number(customerData.pincodeId)
          : null,

        entryDate: customerData.entryDate
          ? new Date(customerData.entryDate)
          : undefined,

        creditLimit: customerData.creditLimit
          ? Number(customerData.creditLimit)
          : null,
      },
    });
    console.log("record in DB:", record);
    return res.status(200).json(serializeBigInt(record));
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message || "Failed to create record",
    });
  }
}

// Update Record
export async function updateRecord(req: Request, res: Response) {
  //logs need to be removed
  console.log("========Update=====");
  console.log("METHOD:", req.method);
  console.log("PARAMS:", req.params);
  console.log("BODY:", req.body);

  try {
    const id = Number(req.params.id);

    const { stateId, cityId, ...customerData } = req.body;

    const record = await prisma.customer.update({
      where: { id },

      data: {
        ...customerData,

        stateId: stateId ? Number(stateId) : null,

        cityId: cityId ? Number(cityId) : null,

        pincodeId: customerData.pincodeId
          ? Number(customerData.pincodeId)
          : null,

        entryDate: customerData.entryDate
          ? new Date(customerData.entryDate)
          : undefined,

        creditLimit: customerData.creditLimit
          ? Number(customerData.creditLimit)
          : null,
      },
    });

    return res.status(201).json(serializeBigInt(record));
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message || "Failed to update record",
    });
  }
}
