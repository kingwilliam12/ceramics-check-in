"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

interface Member {
  id: string;
  full_name: string;
  email: string;
}

export default function MembersList() {
  const [data, setData] = useState<Member[]>([]);

  useEffect(() => {
    supabase.from('members').select('*').then(({ data }) => setData(data ?? []));
  }, []);

  const columns: ColumnDef<Member>[] = [
    { header: 'Name', accessorKey: 'full_name' },
    { header: 'Email', accessorKey: 'email' },
  ];

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
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
  );
}
