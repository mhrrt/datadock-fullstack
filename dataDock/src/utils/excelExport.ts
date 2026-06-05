import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ZipWriter, BlobWriter, Uint8ArrayReader } from "@zip.js/zip.js";

export async function exportRecordsToExcel(
  rows: any[],
  fileName: string,
  passwordProtect = false,
) {
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Records");

  worksheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Date", key: "entryDate", width: 15 },
    { header: "Name", key: "name", width: 30 },
    { header: "Code Name", key: "codeName", width: 20 },
    { header: "State", key: "state", width: 20 },
    { header: "City", key: "city", width: 20 },
    { header: "Pincode", key: "pincode", width: 15 },
    { header: "Bazar", key: "bazar", width: 20 },
    { header: "Phone 1", key: "phone1", width: 18 },
    { header: "Phone 2", key: "phone2", width: 18 },
    { header: "Office Phone 1", key: "officePhone1", width: 20 },
    { header: "Office Phone 2", key: "officePhone2", width: 20 },
    { header: "Bhaw MD", key: "bhawMD", width: 20 },
    { header: "Bhaw KRM", key: "bhawKRM", width: 20 },
    { header: "Credit Limit", key: "creditLimit", width: 18 },
    { header: "Reference Number", key: "referenceNumber", width: 20 },
    { header: "Reference Name", key: "referenceName", width: 25 },
    { header: "Remark", key: "remark", width: 40 },
    { header: "Created By", key: "createdBy", width: 20 },
  ];

  rows.forEach((row) => {
    worksheet.addRow({
      id: row.id,
      entryDate: row.entryDate
        ? new Date(row.entryDate).toLocaleDateString("en-GB")
        : "",
      name: row.name,
      codeName: row.codeName,
      state: row.state?.name ?? "",
      city: row.city?.name ?? "",
      pincode: row.pincode?.pinCode ?? "",
      bazar: row.bazarId ?? "",
      phone1: row.phone1,
      phone2: row.phone2,
      officePhone1: row.officePhone1,
      officePhone2: row.officePhone2,
      bhawMD: row.bhawMD,
      bhawKRM: row.bhawKRM,
      creditLimit: row.creditLimit,
      referenceNumber: row.referenceNumber,
      referenceName: row.referenceName,
      remark: row.remark,
      createdBy: row.createdBy?.userName ?? "",
    });
  });

  // Header Styling
  const headerRow = worksheet.getRow(1);

  headerRow.font = {
    bold: true,
    color: { argb: "FFFFFF" },
  };

  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "1E40AF" },
  };

  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  // Alternate row colors
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F8FAFC" },
        };
      });
    }
  });

  // Borders
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  // Normal Excel Export
  if (!passwordProtect) {
    saveAs(new Blob([buffer]), fileName);
    return;
  }

  // Password Protected ZIP Export
  const password = prompt("Enter password for ZIP file");

  if (!password) {
    return;
  }

  const zipWriter = new ZipWriter(new BlobWriter("application/zip"));

  await zipWriter.add(fileName, new Uint8ArrayReader(new Uint8Array(buffer)), {
    password,
    encryptionStrength: 3, // AES-256
  });

  const zipBlob = await zipWriter.close();

  saveAs(zipBlob, fileName.replace(".xlsx", ".zip"));
}
