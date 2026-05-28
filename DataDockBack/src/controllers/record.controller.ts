import { Request, Response } from "express";
import { searchRecordSchema } from "../validators/record.validator";
import { searchRecords } from "../services/record.service";
import prisma from "../config/prisma";

// ==========================================
// GET RECORDS
// ==========================================

export async function getRecords(req: Request, res: Response) 
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
{
  try {
    const records = await prisma.customer.findMany({
      include:{
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

    return res.status(200).json(
      JSON.parse(
        JSON.stringify(
          records,
          (_, value) => 
            typeof value === "bigint"
          ? value.toString()
          : value,
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

// ==========================================
// CREATE RECORD
// ==========================================

export async function createRecord(req: Request, res: Response) {
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
    return res.status(201).json(
      JSON.parse(
        JSON.stringify(
          record,
          (_, value) =>
            typeof value === "bigint"
          ? value.toString()
          : value,
        ),
      ),
    );
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message || "Failed to create record",
    });
  }
}
