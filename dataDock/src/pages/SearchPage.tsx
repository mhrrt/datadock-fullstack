import { useCallback, useEffect, useMemo, useState, useRef } from "react";

// import axios from "axios";

import { AgGridReact } from "ag-grid-react";

import type { ColDef } from "ag-grid-community";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import "ag-grid-community/styles/ag-theme-quartz.css";

import api from "../services/api";

// import * as XLSX from "xlsx";
import type { GridApi } from "ag-grid-community";
// import { ZipWriter, BlobWriter, Uint8ArrayReader } from "@zip.js/zip.js";

import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { exportRecordsToExcel, getTimestamp } from "../utils/excelExport";

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
    pinCode: string;
  };

  // bazar?: {
  //   name: string;
  // };
  bazarId?: string;

  createdBy?: {
    userName: string;
  };

  //adding option for pending, recoved and status for customer
  pendingAmount: number;
  receivedAmount: number;
  outstandingAmount: number;
  recoveryRemark: string;
  status: "ACTIVE" | "INACTIVE" | "RESTRICTED";
};

const SearchPage = () => {
  const [rowData, setRowData] = useState<RecordRow[]>([]);
  // for loading All or Defaulter list
  const { mode } = useParams();
  const isForActiveMode = mode === "true";

  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);

      // const response = await axios.get("http://localhost:5000/api/records");
      console.log(`fetchRecords url: ${mode}`);
      const response = await api.get(`api/records?mode=${mode}`);

      //console.log(response.data);
      setRowData(response.data || []);
    } catch (error) {
      console.error(error);
      console.error("Full error:", JSON.stringify(error, null, 2));

      // alert("Failed to fetch records");
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  }, [mode]);

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
        hide: true,
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
        headerName: "NAME",
        minWidth: 220,
      },

      {
        field: "codeName",
        headerName: "CODE NAME",
        minWidth: 100,
      },

      {
        field: "State",
        headerName: "STATE",
        minWidth: 160,
        valueGetter: (params) => params.data?.state?.name || "",
      },

      {
        field: "CITY",
        headerName: "City",
        minWidth: 160,
        valueGetter: (params) => params.data?.city?.name || "",
      },

      {
        field: "Pincode",
        headerName: "PINCODE",
        minWidth: 140,
        valueGetter: (params) => params.data?.pincode?.pinCode || "",
      },

      {
        field: "Bazar",
        headerName: "BAZAR",
        minWidth: 160,
        valueGetter: (params) => params.data?.bazarId || "",
      },

      {
        field: "phone1",
        headerName: "PHONE 1",
        minWidth: 160,
      },

      {
        field: "phone2",
        headerName: "PHONE 2",
        minWidth: 160,
      },

      {
        field: "officePhone1",
        headerName: "OFF PHONE 1",
        minWidth: 180,
      },

      {
        field: "officePhone2",
        headerName: "OFF PHONE 2",
        minWidth: 180,
      },

      {
        field: "bhawMD",
        headerName: "BHAV MD",
        minWidth: 140,
      },

      {
        field: "bhawKRM",
        headerName: "BHAV KRM",
        minWidth: 140,
      },

      {
        field: "creditLimit",
        headerName: "LIMIT",
        minWidth: 140,
      },

      {
        field: "referenceNumber",
        headerName: "REFERANCE NO",
        minWidth: 100,
      },

      {
        field: "referenceName",
        headerName: "REFERENCE NAME",
        minWidth: 100,
      },

      {
        field: "remark",
        headerName: "REMARK",
        flex: 1,
        minWidth: 250,
      },

      {
        field: "pendingAmount",
        headerName: "PENDING AMT",
        minWidth: 150,
      },
      {
        field: "receivedAmount",
        headerName: "RECEIVED AMT",
        minWidth: 150,
      },
      {
        field: "outstandingAmount",
        headerName: "OUTSTANDING AMT",
        minWidth: 150,
      },

      {
        headerName: "Status",
        field: "status",
        cellClassRules: {
          "status-active": (params) => params.value?.toUpperCase() === "ACTIVE",

          "status-inactive": (params) =>
            params.value?.toUpperCase() === "INACTIVE",

          "status-restricted": (params) =>
            params.value?.toUpperCase() === "RESTRICTED",
        },
        width: 150,
      },

      {
        field: "recoveryRemark",
        headerName: "Recovery Notes",
        flex: 1,
        minWidth: 200,
      },

      {
        field: "isActive",
        headerName: "CUST STATUS",
        minWidth: 140,

        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },

        headerClass: "ag-center-header",

        cellRenderer: (params: { value: boolean }) => (
          <span
            style={{
              color: params.value ? "#16A34A" : "#DC2626",
              fontWeight: "bold",
            }}
          >
            {params.value ? "✓" : "✗"}
          </span>
        ),
      },
      {
        headerName: "Created By",
        minWidth: 180,
        valueGetter: (params) => params.data?.createdBy?.userName || "",
      },
    ],
    [],
  );

  const defaulterColumnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 30,
        pinned: "left",
        hide: true,
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
        headerName: "NAME",
        minWidth: 220,
      },

      {
        field: "codeName",
        headerName: "CODE NAME",
        minWidth: 100,
      },

      //  {
      //    field: "State",
      //    headerName: "STATE",
      //    minWidth: 160,
      //    valueGetter: (params) => params.data?.state?.name || "",
      //  },

      //  {
      //    field: "CITY",
      //    headerName: "City",
      //    minWidth: 160,
      //    valueGetter: (params) => params.data?.city?.name || "",
      //  },

      //  {
      //    field: "Pincode",
      //    headerName: "PINCODE",
      //    minWidth: 140,
      //    valueGetter: (params) => params.data?.pincode?.pinCode || "",
      //  },

      //  {
      //    field: "Bazar",
      //    headerName: "BAZAR",
      //    minWidth: 160,
      //    valueGetter: (params) => params.data?.bazarId || "",
      //  },

      {
        field: "phone1",
        headerName: "PHONE 1",
        minWidth: 160,
      },

      {
        field: "phone2",
        headerName: "PHONE 2",
        minWidth: 160,
      },

      // {
      //   field: "officePhone1",
      //   headerName: "OFF PHONE 1",
      //   minWidth: 180,
      // },

      // {
      //   field: "officePhone2",
      //   headerName: "OFF PHONE 2",
      //   minWidth: 180,
      // },

      //  {
      //    field: "bhawMD",
      //    headerName: "BHAV MD",
      //    minWidth: 140,
      //  },

      //  {
      //    field: "bhawKRM",
      //    headerName: "BHAV KRM",
      //    minWidth: 140,
      //  },

      //  {
      //    field: "creditLimit",
      //    headerName: "LIMIT",
      //    minWidth: 140,
      //  },

      //  {
      //    field: "referenceNumber",
      //    headerName: "REFERANCE NO",
      //    minWidth: 100,
      //  },

      //  {
      //    field: "referenceName",
      //    headerName: "REFERENCE NAME",
      //    minWidth: 100,
      //  },

      {
        field: "pendingAmount",
        headerName: "PENDING AMT",
        minWidth: 150,
      },
      {
        field: "receivedAmount",
        headerName: "RECEIVED AMT",
        minWidth: 150,
      },
      {
        field: "outstandingAmount",
        headerName: "OUTSTANDING AMT",
        minWidth: 150,
      },

      // {
      //   headerName: "Status",
      //   field: "status",
      //   cellClassRules: {
      //     "status-active": (params) => params.value?.toUpperCase() === "ACTIVE",

      //     "status-inactive": (params) =>
      //       params.value?.toUpperCase() === "INACTIVE",

      //     "status-restricted": (params) =>
      //       params.value?.toUpperCase() === "RESTRICTED",
      //   },
      //   width: 150,
      // },

      {
        field: "remark",
        headerName: "REMARK",
        flex: 1,
        minWidth: 250,
      },

      {
        field: "recoveryRemark",
        headerName: "Recovery Notes",
        flex: 1,
        minWidth: 200,
      },

      {
        field: "isActive",
        headerName: "CUST STATUS",
        minWidth: 140,

        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },

        headerClass: "ag-center-header",

        cellRenderer: (params: { value: boolean }) => (
          <span
            style={{
              color: params.value ? "#16A34A" : "#DC2626",
              fontWeight: "bold",
            }}
          >
            {params.value ? "✓" : "✗"}
          </span>
        ),
      },
      //  {
      //    headerName: "Created By",
      //    minWidth: 180,
      //    valueGetter: (params) => params.data?.createdBy?.userName || "",
      //  },
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

  // for data export
  const gridApiRef = useRef<GridApi | null>(null);
  const [hasFilters, setHasFilters] = useState(false);
  const gridRef = useRef<AgGridReact>(null);
  const onFilterChanged = () => {
    setHasFilters(gridRef.current?.api?.isAnyFilterPresent() ?? false);
  };
  const canExportVisible = !!searchText.trim() || hasFilters;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // will export all records in customer table
  const exportAllRecords = async () => {
    // exportRowsToExcel(
    //   rowData,
    //   `DataDock_All_Records_${new Date().toISOString().split("T")[0]}.xlsx`,
    // );

    const today = getTimestamp();
    await exportRecordsToExcel(
      rowData,
      `DataDock_All_Records_${isForActiveMode ? "defaulter" : ""}_${today}.xlsx`,
      passwordProtect,
    );
  };

  // will export records in grid only
  const exportVisibleRecords = async () => {
    const visibleRows: RecordRow[] = [];

    gridApiRef.current?.forEachNodeAfterFilterAndSort((node) => {
      visibleRows.push(node.data);
    });

    const today = getTimestamp();
    await exportRecordsToExcel(
      visibleRows,
      `DataDock_Filtered_Records_${isForActiveMode ? "defaulter" : ""}_${today}.xlsx`,
      passwordProtect,
    );
  };
  // password protection
  const [passwordProtect, setPasswordProtect] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl text-blue-600 font-bold">
            {isForActiveMode ? "Defaulter List" : "Search Customer"}
          </h1>

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
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={isForActiveMode ? columnDefs : defaulterColumnDefs}
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
              if (isForActiveMode) {
                navigate(`/edit/${event.data.id}`);
              } else {
                navigate(`/edit/${event.data.id}/defaulter`);
              }
            }}
            onFilterChanged={onFilterChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
