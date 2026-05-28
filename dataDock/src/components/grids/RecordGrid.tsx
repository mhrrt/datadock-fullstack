import { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef,
    RowSelectionOptions,

 } from 'ag-grid-community';
// import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

interface Props {
  rows: any[];
}

export default function RecordGrid({ rows }: Props) {
  const gridRef = useRef<AgGridReact>(null);

  const columnDefs = useMemo<ColDef[]>(() => {
    return [
      {
        field: "name",
        filter: true,
        sortable: true,
        flex: 1,
      },
      {
        field: "age",
        width: 120,
      },
      {
        field: "interest",
        flex: 1,
      },
      {
        field: "remark",
        flex: 1,
      },
      {
        field: "createdAt",
        flex: 1,
        valueFormatter: (params) => {
          return new Date(params.value).toLocaleDateString();
        },
      },
    ];
  }, []);

  const rowSelection =
    useMemo <
    RowSelectionOptions>(
      () => ({
        mode: "multiRow" as const,
        checkboxes: true,
        headerCheckbox: true,
        enableClickSelection: true,
      }),
      [],
    );

  const exportData = () => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: "datadock-records.csv",
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={exportData}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Export CSV
        </button>
      </div>

      <div
        className="ag-theme-quartz"
        style={{
          height: 600,
          width: "100%",
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          pagination
          paginationPageSize={20}
          rowSelection={rowSelection}
        //   suppressRowClickSelection={false}
          animateRows
        />
      </div>
    </div>
  );
}