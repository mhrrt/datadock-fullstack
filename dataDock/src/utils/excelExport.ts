import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ZipWriter, BlobWriter, Uint8ArrayReader } from "@zip.js/zip.js";

export const getTimestamp = () => {
  const now = new Date();

  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();

  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return `${dd}-${mm}-${yyyy}-${hh}-${min}-${ss}`;
};

export async function exportRecordsToExcel(
  rows: any[],
  fileName: string,
  passwordProtect = false,
) {
  const EXPORT_THEME = {
    titleBg: "1976D2", // same as AG Grid header
    titleText: "FFFFFF",

    headerBg: "1976D2",
    headerText: "FFFFFF",

    rowText: "212121",

    oddRowBg: "FFFFFF",
    evenRowBg: "F5F5F5",
  };

  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Records");

  // suggested excel template with frozen header, Adding title row
  worksheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "DATE", key: "entryDate", width: 15 },
    { header: "NAME", key: "name", width: 30 },
    { header: "CODE NAME", key: "codeName", width: 20 },
    { header: "STATE", key: "state", width: 20 },
    { header: "CITY", key: "city", width: 20 },
    { header: "PINCODE", key: "pincode", width: 15 },
    { header: "BAZAR", key: "bazar", width: 20 },
    { header: "PHONE 1", key: "phone1", width: 18 },
    { header: "PHONE 2", key: "phone2", width: 18 },
    { header: "OFFICE PHONE 1", key: "officePhone1", width: 20 },
    { header: "OFFICE PHONE 2", key: "officePhone2", width: 20 },
    { header: "BHAV MD", key: "bhawMD", width: 20 },
    { header: "BHAV KRM", key: "bhawKRM", width: 20 },
    { header: "CREDIT LIMIT", key: "creditLimit", width: 18 },
    { header: "REFERENCE NUMBER", key: "referenceNumber", width: 20 },
    { header: "REFERENCE NAME", key: "referenceName", width: 25 },
    { header: "REMARK", key: "remark", width: 40 },
    { header: "CREATED BY", key: "createdBy", width: 20 },
  ];

  //move to third row now
  worksheet.spliceRows(1, 0, [], []);

  worksheet.mergeCells("A1:S1");

  const titleCell = worksheet.getCell("A1");
  titleCell.value = "DATA DOCK CUSTOMER EXPORT";

  titleCell.font = {
    bold: true,
    size: 16,
    color: { argb: EXPORT_THEME.titleText },
  };

  titleCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: EXPORT_THEME.titleBg },
  };
  worksheet.getRow(1).height = 28;

  // add timestamp
  worksheet.mergeCells("A2:S2");

  const dateCell = worksheet.getCell("A2");
  dateCell.value = `Generated On: ${getTimestamp()}`;

  dateCell.font = {
    italic: true,
  };

  dateCell.alignment = {
    horizontal: "center",
  };

  worksheet.getRow(2).height = 20;

  // Header Styling, moving to thired row
  const headerRow = worksheet.getRow(3);

  headerRow.font = {
    bold: true,
    color: { argb: EXPORT_THEME.headerText },
  };

  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: EXPORT_THEME.headerBg },
  };

  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  headerRow.height = 22;

  //freeze header row
  worksheet.views = [
    {
      state: "frozen",
      ySplit: 3,
    },
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

  //adding excel filters by default in template
  //   worksheet.autoFilter = {
  //     from: "A3",
  //     to: "S3",
  //   };

  // Alternate row colors
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 3 && rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: EXPORT_THEME.evenRowBg },
        };
      });
    } else if (rowNumber > 3 && rowNumber % 2 != 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: EXPORT_THEME.oddRowBg },
        };
      });
    }
  });

  // Borders
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "#130105ce" } },
        bottom: { style: "thin", color: { argb: "#130105ce" } },
        left: { style: "thin", color: { argb: "#130105ce" } },
        right: { style: "thin", color: { argb: "#130105ce" } },
      };
    });
  });

  //making values as bold
  worksheet.eachRow((row, rowNumber) => {
    // Skip title, timestamp and header rows
    if (rowNumber > 3) {
      row.font = {
        bold: true,
      };
    }
  });
  //custome column aligmnet to match with header
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 3) return;

    row.eachCell((cell, colNumber) => {
      // ID
      if (colNumber === 1) {
        cell.alignment = {
          horizontal: "center",
        };
      }

      // Credit Limit
      if (colNumber === 15) {
        cell.alignment = {
          horizontal: "right",
        };
        cell.numFmt = "#,##0.00";
      }

      // Phones
      if ([9, 10, 11, 12].includes(colNumber)) {
        cell.alignment = {
          horizontal: "center",
        };
      }
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
