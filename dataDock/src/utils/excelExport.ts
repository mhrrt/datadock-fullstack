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
  isForActiveMode = true,
) {
  const EXPORT_THEME = {
    titleBg: "1565C0",
    titleText: "FFFFFF",

    oddRowBg: "FFFFFF",
    evenRowBg: "FAFAFA",

    border: "D6DBDF",
  };

  const HEADER_COLORS = [
    "D6EAF8", // ID
    "EBF5FB", // Date
    "E8F8F5", // Name
    "FCF3CF", // Code
    "FDEBD0", // Code Name
    "EBDEF0", // State
    "D4E6F1", // City
    "EAECEE", // Pincode
    "D5F5E3", // Bazar
    "F9E79F", // Phone1
    "FADBD8", // Phone2
    "D6DBDF", // Office1
    "EAF2F8", // Office2
    "F6DDCC", // MD
    "E8DAEF", // KRM
    "D1F2EB", // Credit
    "FCF3CF", // Ref No
    "FDEDEC", // Ref Name
    "D4EFDF", // By Whom
    "EBF5FB", // Remark
    "FEF9E7", // Pending
    "D5F5E3", // Received
    "FADBD8", // Outstanding
    "E8F6F3", // Status
    "E5E7E9", // Recovery
    "EBF5FB", // Created By
  ];

  // const COLUMN_BODY_COLORS = [
  //   "F8FCFE", // ID
  //   "F9FDFF", // Date
  //   "FBFEFC", // Name
  //   "FFFDF2", // Code
  //   "FFF8F2", // Code Name
  //   "FBF8FD", // State
  //   "F8FBFD", // City
  //   "FAFBFC", // Pincode
  //   "F8FDF9", // Bazar
  //   "FFFBEA", // Phone1
  //   "FFF7F6", // Phone2
  //   "FAFBFC", // Office1
  //   "F9FCFE", // Office2
  //   "FFF8F5", // MD
  //   "FCF9FD", // KRM
  //   "F5FCFB", // Credit
  //   "FFFDF4", // Ref No
  //   "FFF8F8", // Ref Name
  //   "F7FCF8", // By Whom
  //   "F8FCFE", // Remark
  //   "FFFDF4", // Pending
  //   "F6FCF8", // Received
  //   "FFF7F6", // Outstanding
  //   "F5FCFA", // Status
  //   "FAFBFC", // Recovery
  //   "F8FCFE", // Created By
  // ];

  // 40% increase in tint compated to above one i commented out
  const COLUMN_BODY_COLORS = [
    "D9ECFB", // ID - Blue
    "D6F2FC", // Date - Sky Blue
    "DDF7EC", // Name - Mint
    "FFF1B8", // Code - Yellow
    "FDDDBF", // Code Name - Peach
    "E7D8F4", // State - Lavender
    "E2E7EB", // City - Grey
    "ECEFF1", // Pincode - Silver
    "D8F2E0", // Bazar - Green
    "FBE8A3", // Phone 1 - Warm Yellow
    "F8D6D2", // Phone 2 - Pink
    "DCE5EA", // Office Phone 1 - Grey Blue
    "DDEFFA", // Office Phone 2 - Ice Blue
    "F8D8C4", // Bhav MD - Sand
    "E8D5F2", // Bhav KRM - Violet
    "D2F3EB", // Credit Limit - Aqua
    "FFE8A1", // Reference Number - Gold
    "F8DBDD", // Reference Name - Rose
    "D8F0D8", // By Whom - Pale Green
    "E1F2FB", // Remark - Baby Blue
    "FFEAB8", // Pending Amount - Cream
    "D8F3E1", // Received Amount - Mint Green
    "F9D9D5", // Outstanding Amount - Coral
    "D7F5EE", // Status - Sea Green
    "E5E9EC", // Recovery Notes - Soft Grey
    "E1F2FB", // Created By - Ice Blue
  ];
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Records");

  const exportData = rows.map((row) => ({
    ...row,
    createdByName: row.createdBy?.fullName ?? "",
  }));

  console.log("row data:", JSON.stringify(exportData, null, 2));

  let rightAlinged = [16, 21, 22, 23];
  let centerAlined = [10, 11, 12, 13, 25];

  // suggested excel template with frozen header, Adding title row
  if (isForActiveMode) {
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 }, // 1
      { header: "DATE", key: "entryDate", width: 15 }, //2
      { header: "NAME", key: "name", width: 30 }, // 3
      { header: "CODE", key: "codeNum", width: 20 }, //4
      { header: "CODE NAME", key: "codeName", width: 20 }, //5
      { header: "STATE", key: "state", width: 20 }, //6
      { header: "CITY", key: "city", width: 20 }, //7
      { header: "PINCODE", key: "pincode", width: 15 }, //8
      { header: "BAZAR", key: "bazar", width: 20 }, //9
      { header: "PHONE 1", key: "phone1", width: 18 }, //10
      { header: "PHONE 2", key: "phone2", width: 18 }, //1
      { header: "OFFICE PHONE 1", key: "officePhone1", width: 20 }, //12
      { header: "OFFICE PHONE 2", key: "officePhone2", width: 20 }, //13
      { header: "BHAV MD", key: "bhawMD", width: 20 }, //14
      { header: "BHAV KRM", key: "bhawKRM", width: 20 }, //15
      { header: "CREDIT LIMIT", key: "creditLimit", width: 18 }, //16
      { header: "REFERENCE NUMBER", key: "referenceNumber", width: 20 }, //17
      { header: "REFERENCE NAME", key: "referenceName", width: 25 }, //18
      { header: "BY WHOM", key: "byWhom", width: 20 }, //19
      { header: "REMARK", key: "remark", width: 40 }, //20
      { header: "PENDING AMT", key: "pendingAmount", width: 15 }, //21
      { header: "RECEIVED AMT", key: "receivedAmount", width: 15 }, //22
      { header: "OUTSTANDING AMT", key: "outstandingAmount", width: 18 }, //23
      { header: "STATUS", key: "status", width: 15 }, //24
      //{ header: "RECOVERY NOTES", key: "recoveryRemark", width: 40 }, //25
      { header: "CREATED BY", key: "createdByName", width: 20 }, //26
    ];
  } else {
    rightAlinged = [6, 7, 8];
    centerAlined = [4, 5, 9];
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 }, // 1
      { header: "DATE", key: "entryDate", width: 15 }, //2
      { header: "NAME", key: "name", width: 30 }, //3
      // { header: "CODE NAME", key: "codeName", width: 20 },
      // { header: "STATE", key: "state", width: 20 },
      // { header: "CITY", key: "city", width: 20 },
      // { header: "PINCODE", key: "pincode", width: 15 },
      // { header: "BAZAR", key: "bazar", width: 20 },
      { header: "PHONE 1", key: "phone1", width: 18 }, //4
      { header: "PHONE 2", key: "phone2", width: 18 }, //5
      // { header: "OFFICE PHONE 1", key: "officePhone1", width: 20 },
      // { header: "OFFICE PHONE 2", key: "officePhone2", width: 20 },
      // { header: "BHAV MD", key: "bhawMD", width: 20 },
      // { header: "BHAV KRM", key: "bhawKRM", width: 20 },
      // { header: "CREDIT LIMIT", key: "creditLimit", width: 18 },
      // { header: "REFERENCE NUMBER", key: "referenceNumber", width: 20 },
      // { header: "REFERENCE NAME", key: "referenceName", width: 25 },
      // { header: "REMARK", key: "remark", width: 40 },
      { header: "PENDING AMT", key: "pendingAmount", width: 15 }, //6
      { header: "RECEIVED AMT", key: "receivedAmount", width: 15 }, //7
      { header: "OUTSTANDING AMT", key: "outstandingAmount", width: 18 }, //8
      { header: "STATUS", key: "status", width: 15 }, //9
      { header: "RECOVERY NOTES", key: "recoveryRemark", width: 40 }, //10
      { header: "CREATED BY", key: "createdByName", width: 20 }, //11
    ];
  }

  //move to third row now
  worksheet.spliceRows(1, 0, [], []);

  worksheet.mergeCells("A1:X1");

  const titleCell = worksheet.getCell("A1");
  titleCell.value = "DATA DOCK CUSTOMER EXPORT";

  titleCell.font = {
    bold: true,
    size: 20,
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
  titleCell.font = {
    bold: true,
    size: 20,
    name: "Calibri",
    color: { argb: "FFFFFF" },
  };
  worksheet.getRow(1).height = 35;

  // add timestamp
  worksheet.mergeCells("A2:X2");

  const dateCell = worksheet.getCell("A2");
  dateCell.value = `Generated On: ${getTimestamp()}`;

  dateCell.font = {
    italic: true,
    color: {
      argb: "666666",
    },
    size: 10,
  };

  dateCell.alignment = {
    horizontal: "center",
  };

  worksheet.getRow(2).height = 20;

  // Header Styling, moving to thired row
  const headerRow = worksheet.getRow(3);

  // headerRow.font = {
  //   bold: true,
  //   color: { argb: EXPORT_THEME.headerText },
  // };

  // // headerRow.fill = {
  // //   type: "pattern",
  // //   pattern: "solid",
  // //   fgColor: { argb: EXPORT_THEME.headerBg },
  // // };
  // // updated template
  // headerRow.eachCell((cell, colNumber) => {
  //   cell.font = {
  //     bold: true,
  //     color: { argb: "333333" },
  //   };

  //   cell.fill = {
  //     type: "pattern",
  //     pattern: "solid",
  //     fgColor: {
  //       argb: COLUMN_HEADER_COLORS[
  //         (colNumber - 1) % COLUMN_HEADER_COLORS.length
  //       ],
  //     },
  //   };

  //   cell.alignment = {
  //     horizontal: "center",
  //     vertical: "middle",
  //   };
  // });

  // headerRow.alignment = {
  //   horizontal: "center",
  //   vertical: "middle",
  // };
  // headerRow.height = 22;

  headerRow.height = 28;

  headerRow.eachCell((cell, index) => {
    cell.font = {
      bold: true,
      size: 11,
      color: {
        argb: "333333",
      },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: HEADER_COLORS[(index - 1) % HEADER_COLORS.length],
      },
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    cell.border = {
      bottom: {
        style: "medium",
        color: { argb: "B0BEC5" },
      },
    };
  });

  headerRow.eachCell((cell) => {
    cell.border = {
      top: {
        style: "thin",
        color: { argb: "90A4AE" },
      },
      bottom: {
        style: "medium",
        color: { argb: "90A4AE" },
      },
    };
  });

  //freeze header row
  worksheet.views = [
    {
      state: "frozen",
      ySplit: 3,
    },
  ];

  exportData.forEach((row) => {
    worksheet.addRow({
      id: row.id,
      entryDate: row.entryDate ? new Date(row.entryDate) : null,
      name: row.name,
      codeName: row.codeName,
      codeNum: row.codeNum,
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
      byWhom: row.byWhom,
      remark: row.remark,
      // for pending amount etc
      pendingAmount: row.pendingAmount,
      receivedAmount: row.receivedAmount,
      outstandingAmount: row.outstandingAmount,
      recoveryRemark: row.recoveryRemark,
      status: row.status,
      createdByName: row.createdBy?.fullName ?? "",
    });
  });

  worksheet.getColumn(2).numFmt = "dd-mmm-yyyy";
  //adding excel filters by default in template
  worksheet.autoFilter = {
    from: {
      row: 3,
      column: 1,
    },
    to: {
      row: 3,
      column: worksheet.columnCount,
    },
  };

  // Alternate row colors, commented out to have even column background
  // worksheet.eachRow((row, rowNumber) => {
  //   if (rowNumber > 3 && rowNumber % 2 === 0) {
  //     row.eachCell((cell) => {
  //       cell.fill = {
  //         type: "pattern",
  //         pattern: "solid",
  //         fgColor: { argb: EXPORT_THEME.evenRowBg },
  //       };
  //     });
  //   } else if (rowNumber > 3 && rowNumber % 2 != 0) {
  //     row.eachCell((cell) => {
  //       cell.fill = {
  //         type: "pattern",
  //         pattern: "solid",
  //         fgColor: { argb: EXPORT_THEME.oddRowBg },
  //       };
  //     });
  //   }
  // });
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 3) return;

    row.eachCell((cell, colNumber) => {
      // Don't overwrite STATUS colors
      const statusColumn =
        worksheet.columns.findIndex((c) => c.key === "status") + 1;

      if (colNumber === statusColumn) return;

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: COLUMN_BODY_COLORS[(colNumber - 1) % COLUMN_BODY_COLORS.length],
        },
      };
    });
  });

  // Borders
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: EXPORT_THEME.border } },
        bottom: { style: "thin", color: { argb: EXPORT_THEME.border } },
        left: { style: "thin", color: { argb: EXPORT_THEME.border } },
        right: { style: "thin", color: { argb: EXPORT_THEME.border } },
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

    const statusColumnIndex =
      worksheet.columns.findIndex((col) => col.key === "status") + 1;

    const statusCell = row.getCell(statusColumnIndex);

    const status = String(statusCell.value || "")
      .trim()
      .toUpperCase();

    if (status === "ACTIVE") {
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "C6EFCE" }, // Light Green
      };

      statusCell.font = {
        bold: true,
        color: { argb: "006100" },
      };
    } else if (status === "RESTRICTED") {
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEB9C" }, // Light Orange/Yellow
      };

      statusCell.font = {
        bold: true,
        color: { argb: "9C6500" },
      };
    } else if (status === "INACTIVE") {
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFC7CE" }, // Light Red
      };

      statusCell.font = {
        bold: true,
        color: { argb: "9C0006" },
      };
    }

    statusCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    row.eachCell((cell, colNumber) => {
      // ID
      if (colNumber === 1) {
        cell.alignment = {
          horizontal: "center",
        };
      }

      // Credit Limit and other number format
      if (rightAlinged.includes(colNumber)) {
        cell.alignment = {
          horizontal: "right",
        };
        cell.font = {
          bold: true,
          color: { argb: "1B5E20" },
        };
      }

      // Phones
      if (centerAlined.includes(colNumber)) {
        cell.alignment = {
          horizontal: "center",
        };
      }

      if (colNumber === 20 || colNumber === 26) {
        cell.alignment = {
          wrapText: true,
          vertical: "top",
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
