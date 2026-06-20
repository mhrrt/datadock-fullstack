import { Request, Response } from "express";
import { searchRecordSchema } from "../validators/record.validator";
import { getNextCodeName, searchRecords } from "../services/record.service";
import prisma from "../config/prisma";
import {
  calculateStatus,
  validateRecoveryAmounts,
} from "../utils/customerStatus";
import { AppError } from "../utils/AppError";
import { Prisma } from "@prisma/client";

// ==========================================
// GET RECORDS
// ==========================================

export async function getRecords(req: Request, res: Response) {
  try {
    //as we are using same search page for active and defaulter both
    const mode = req.query.mode;
    console.log(`datadockbackend selecting records for mode:${mode}`);
    let whereClause: Prisma.CustomerWhereInput = {
      isActive: true,
    };

    if (mode === "false") {
      console.log("datadock backend within mode condtion as false");
      whereClause = {
        isActive: false,
        pendingAmount: {
          gte: 0,
        },
      };
    }
    console.log(`mode and whareclause: ${mode} and clause:${whereClause}`);
    console.log("mode:", mode);
    console.log("whereClause:", JSON.stringify(whereClause, null, 2));
    const records = await prisma.customer.findMany({
      include: {
        state: true,
        city: true,
        pincode: true,
        createdBy: true,
      },
      where: whereClause,
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
  console.log("CreateBy", req.user ?? "userid is null");
  try {
    const { stateId, cityId, ...customerData } = req.body;

    const createdById = req.user?.userId;
    console.log("createdById", createdById ?? "userid is null");
    let codeName = req.body.codeName?.trim();

    if (!codeName) {
      codeName = await getNextCodeName();
    }

    // adding option for addeing Pending, outstanding and customer status
    const pendingAmount = Number(req.body.pendingAmount || 0);

    const receivedAmount = Number(req.body.receivedAmount || 0);

    //check if pending and received amount are valid
    validateRecoveryAmounts(pendingAmount, receivedAmount);

    const { status, outstandingAmount } = calculateStatus(
      pendingAmount,
      receivedAmount,
    );

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

        createdById: createdById ?? null,

        pendingAmount,
        receivedAmount,
        outstandingAmount,
        status,
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
  console.log(prisma.customer.fields ?? "No fields metadata");
  console.log("REQ BODY:", JSON.stringify(req.body, null, 2));
  try {
    const id = Number(req.params.id);

    const { stateId, cityId, ...customerData } = req.body;

    const createdById = req.user?.userId;
    console.log("Edit createdById", createdById ?? "userid is null");

    const pendingAmount = Number(req.body.pendingAmount || 0);

    const receivedAmount = Number(req.body.receivedAmount || 0);

    const { status, outstandingAmount } = calculateStatus(
      pendingAmount,
      receivedAmount,
    );
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

        createdById: createdById ?? null,

        pendingAmount,
        receivedAmount,
        outstandingAmount,
        status,
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
