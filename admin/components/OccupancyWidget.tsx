"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import * as XLSX from 'xlsx';

interface Row {
  member_id: string;
  full_name: string;
  occupancy_count: number;
}

export default function OccupancyWidget() {
  const [data, setData] = useState<Row[]>([]);

  useEffect(() => {
    // query: count of open sessions per member
    supabase.rpc('current_occupancy').then(({ data }) => {
      setData(data ?? []);
    });
  }, []);

  const columns: ColumnDef<Row>[] = [
    { header: 'Member', accessorKey: 'full_name' },
    { header: 'Count', accessorKey: 'occupancy_count' },
  ];

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  const exportXlsx = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'occupancy');
    XLSX.writeFile(workbook, 'occupancy.xlsx');
  };

  const exportCsv = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'occupancy.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button onClick={exportCsv}>Export CSV</button>
      <button onClick={exportXlsx}>Export XLSX</button>
      <table>
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(h => (
                <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(r => (
            <tr key={r.id}>
              {r.getVisibleCells().map(c => (
                <td key={c.id}>{flexRender(c.column.columnDef.cell ?? '', c.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
