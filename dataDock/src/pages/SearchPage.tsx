import { useCallback, useEffect, useMemo, useState, useRef } from "react";

// import axios from "axios";

import { AgGridReact } from "ag-grid-react";

import type { ColDef } from "ag-grid-community";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import "ag-grid-community/styles/ag-theme-quartz.css";

import api from "../services/api";

import * as XLSX from "xlsx";
import type { GridApi } from "ag-grid-community";
import { ZipWriter, BlobWriter, Uint8ArrayReader } from "@zip.js/zip.js";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

ModuleRegistry.registerModules([AllCommunityModule]);

type RecordRow = {
  id: number;

  entryDate: string;

  name: string;

  codeName: string;

  phone1: string;

  phone2: string;

  officePhone1: string;

  officePhone2: string;

  bhawMD: string;

  bhawKRM: string;

  creditLimit: number;

  referenceNumber: string;

  referenceName: string;

  remark: string;

  state?: {
    name: string;
  };

  city?: {
    name: string;
  };

  pincode?: {
    code: string;
  };

  bazar?: {
    name: string;
  };

  createdBy?: {
    userName: string;
  };
};

const SearchPage = () => {
  const [rowData, setRowData] = useState<RecordRow[]>([]);

  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);

      // const response = await axios.get("http://localhost:5000/api/records");
      const response = await api.get("api/records");

      //console.log(response.data);
      setRowData(response.data || []);
    } catch (error) {
      console.error(error);

      // alert("Failed to fetch records");
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }, []);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 30,
        pinned: "left",
      },

      {
        field: "entryDate",
        headerName: "Date",
        filter: "agDateColumnFilter",
        minWidth: 155,
        valueFormatter: (params) => {
          if (!params.value) return "";

          const date = new Date(params.value);

          return date.toLocaleDateString("en-UK", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
      },

      {
        field: "name",
        headerName: "Name",
        minWidth: 220,
      },

      {
        field: "codeName",
        headerName: "Code Name",
        minWidth: 100,
      },

      {
        headerName: "State",
        minWidth: 160,
        valueGetter: (params) => params.data?.state?.name || "",
      },

      {
        headerName: "City",
        minWidth: 160,
        valueGetter: (params) => params.data?.city?.name || "",
      },

      {
        headerName: "Pincode",
        minWidth: 140,
        valueGetter: (params) => params.data?.pincode?.pinCode || "",
      },

      {
        headerName: "Bazar",
        minWidth: 160,
        valueGetter: (params) => params.data?.bazarId || "",
      },

      {
        field: "phone1",
        headerName: "Phone 1",
        minWidth: 160,
      },

      {
        field: "phone2",
        headerName: "Phone 2",
        minWidth: 160,
      },

      {
        field: "officePhone1",
        headerName: "Off Phone 1",
        minWidth: 180,
      },

      {
        field: "officePhone2",
        headerName: "Off Phone 2",
        minWidth: 180,
      },

      {
        field: "bhawMD",
        headerName: "Bhaw MD",
        minWidth: 140,
      },

      {
        field: "bhawKRM",
        headerName: "Bhaw KRM",
        minWidth: 140,
      },

      {
        field: "creditLimit",
        headerName: "Limit",
        minWidth: 140,
      },

      {
        field: "referenceNumber",
        headerName: "Reference No",
        minWidth: 180,
      },

      {
        field: "referenceName",
        headerName: "Reference Name",
        minWidth: 220,
      },

      {
        field: "remark",
        headerName: "Remark",
        flex: 1,
        minWidth: 250,
      },

      {
        headerName: "Created By",

        minWidth: 180,

        valueGetter: (params) => params.data?.createdBy?.userName || "",
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,

      filter: true,

      floatingFilter: true,

      resizable: true,

      minWidth: 120,

      flex: 1,

      wrapHeaderText: true,
      autoHeaderHeight: true,
    }),
    [],
  );

  // commented as row selection not required
  // const rowSelection = useMemo(
  //   () => ({
  //     mode: "multiRow" as const,
  //     checkboxes: true,
  //     headerCheckbox: true,
  //     enableClickSelection: true,
  //   }),
  //   [],
  // );

  // for data export
  const gridApiRef = useRef<GridApi | null>(null);
  const [hasFilters, setHasFilters] = useState(false);
  const gridRef = useRef<AgGridReact>(null);
  const onFilterChanged = () => {
    setHasFilters(gridRef.current?.api?.isAnyFilterPresent() ?? false);
  };
  const canExportVisible = !!searchText.trim() || hasFilters;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // const exportToExcel = () => {
  //   const excelData = rowData.map((row) => ({
  //     ID: row.id,
  //     Date: row.entryDate,
  //     Name: row.name,
  //     "Code Name": row.codeName,
  //     State: row.state?.name || "",
  //     City: row.city?.name || "",
  //     Pincode: row.pincode?.code || "",
  //     Bazar: row.bazar?.name || "",
  //     "Phone 1": row.phone1,
  //     "Phone 2": row.phone2,
  //     "Office Phone 1": row.officePhone1,
  //     "Office Phone 2": row.officePhone2,
  //     "Bhaw MD": row.bhawMD,
  //     "Bhaw KRM": row.bhawKRM,
  //     "Credit Limit": row.creditLimit,
  //     "Reference Number": row.referenceNumber,
  //     "Reference Name": row.referenceName,
  //     Remark: row.remark,
  //     "Created By": row.createdBy?.userName || "",
  //   }));

  //   const worksheet = XLSX.utils.json_to_sheet(excelData);

  //   const workbook = XLSX.utils.book_new();

  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Records");

  //   XLSX.writeFile(
  //     workbook,
  //     `DataDock_Records_${new Date().toISOString().split("T")[0]}.xlsx`,
  //   );
  // };

  // export all or listed rows only based on parameters
  const exportRowsToExcel = async (rows: RecordRow[], fileName: string) => {
    const excelData = rows.map((row) => ({
      ID: row.id,
      Date: row.entryDate,
      Name: row.name,
      "Code Name": row.codeName,
      State: row.state?.name || "",
      City: row.city?.name || "",
      Pincode: row.pincode?.code || "",
      Bazar: row.bazar?.name || "",
      "Phone 1": row.phone1,
      "Phone 2": row.phone2,
      "Office Phone 1": row.officePhone1,
      "Office Phone 2": row.officePhone2,
      "Bhaw MD": row.bhawMD,
      "Bhaw KRM": row.bhawKRM,
      "Credit Limit": row.creditLimit,
      "Reference Number": row.referenceNumber,
      "Reference Name": row.referenceName,
      Remark: row.remark,
      "Created By": row.createdBy?.userName || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Records");

    // commenting out as need to check if user is looking for normal export or protected export
    // XLSX.writeFile(workbook, fileName);
    await exportWorkbook(workbook, fileName);
  };

  // will export all records in customer table
  const exportAllRecords = async () => {
    exportRowsToExcel(
      rowData,
      `DataDock_All_Records_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // will export records in grid only
  const exportVisibleRecords = async () => {
    const visibleRows: RecordRow[] = [];

    gridApiRef.current?.forEachNodeAfterFilterAndSort((node) => {
      visibleRows.push(node.data);
    });

    exportRowsToExcel(
      visibleRows,
      `DataDock_Filtered_Records_${
        new Date().toISOString().split("T")[0]
      }.xlsx`,
    );
  };
  // password protection
  const [passwordProtect, setPasswordProtect] = useState(false);

  const exportWorkbook = async (workbook: XLSX.WorkBook, fileName: string) => {
    if (!passwordProtect) {
      XLSX.writeFile(workbook, fileName);
      return;
    }

    const password = prompt("Enter password for the ZIP file");

    if (!password) {
      return;
    }

    await downloadProtectedZip(
      workbook,
      fileName.replace(".xlsx", ".zip"),
      password,
    );
  };

  const downloadProtectedZip = async (
    workbook: XLSX.WorkBook,
    zipFileName: string,
    password: string,
  ) => {
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));

    await zipWriter.add(
      "DataDock.xlsx",
      new Uint8ArrayReader(new Uint8Array(excelBuffer)),
      {
        password,
        encryptionStrength: 3, // AES-256
      },
    );

    const zipBlob = await zipWriter.close();

    const url = URL.createObjectURL(zipBlob);

    const link = document.createElement("a");

    link.href = url;
    link.download = zipFileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl text-blue-600 font-bold">Search Customer</h1>

          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search records..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 md:w-80"
          />
          <div className="flex gap-3">
            {/* this one is for export all records */}
            {/* <button
            onClick={exportToExcel}
            className="rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700"
          >
            Export Excel
          </button> */}
            {/* added option to either export all records or selected one in grid only */}
            <button
              onClick={exportAllRecords}
              className="rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700"
            >
              Export All
            </button>

            <button
              onClick={exportVisibleRecords}
              disabled={!canExportVisible}
              className={`rounded-lg px-4 py-3 text-white ${
                canExportVisible
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Export Visible
            </button>

            <label className="ml-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={passwordProtect}
                onChange={(e) => setPasswordProtect(e.target.checked)}
              />
              Protected
            </label>
          </div>
        </div>

        <div
          className="ag-theme-quartz border-2 border-slate-500 rounded-lg overflow-hidden shadow-sm"
          style={{
            height: "75vh",
            width: "100%",
          }}
        >
          {/* <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            loading={loading}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[20, 50, 100]}
            quickFilterText={searchText}
            animateRows={true}
            rowSelection={{
              mode: "multiRow" as const,
              checkboxes: true,
              headerCheckbox: true,
              enableClickSelection: true,
            }}
          /> */}
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            loading={loading}
            pagination={true}
            paginationPageSize={50}
            paginationPageSizeSelector={[50, 100, 150]}
            quickFilterText={searchText}
            animateRows={true}
            // rowSelection={rowSelection}
            getRowId={(params) => String(params.data.id)}
            domLayout="normal"
            rowBuffer={10}
            onGridReady={(params) => {
              gridApiRef.current = params.api;
            }}
            onRowDoubleClicked={(event) => {
              navigate(`/edit/${event.data.id}`);
            }}
            onFilterChanged={onFilterChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
