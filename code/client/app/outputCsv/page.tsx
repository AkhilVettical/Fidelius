'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { parse } from 'papaparse'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { Table as TableIcon } from 'lucide-react'

// Define interface for CSV data
interface CsvData {
  headers: string[]
  rows: string[][]
}

export default function EnhancedCsvViewer() {
  const [csvData, setCsvData] = useState<CsvData | null>(null)
  const [visibleRows, setVisibleRows] = useState<number>(0)
  const [columns, setColumns] = useState<ColumnDef<any>[]>([])
  const [tableData, setTableData] = useState<any[]>([])
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})

  // Fetch and parse the CSV file
  useEffect(() => {
    const loadCsvData = async () => {
      try {
        const response = await fetch('/output.csv') // CSV file should be placed in the /public directory
        const csvText = await response.text()

        // Parse the CSV data using PapaParse
        parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const headers = result.meta.fields || []
            const rows = result.data

            const cols = headers.map(key => ({
              accessorKey: key,
              header: key,
            }))

            setColumns(cols)
            setTableData(rows)
            setCsvData({ headers, rows })

            const initialVisibility = cols.reduce((acc, col) => {
              acc[col.accessorKey as string] = true
              return acc
            }, {} as Record<string, boolean>)
            setColumnVisibility(initialVisibility)
          }
        })
      } catch (error) {
        console.error('Error loading CSV:', error)
      }
    }

    loadCsvData()
  }, [])

  // Animate the row display
  useEffect(() => {
    if (csvData && visibleRows < csvData.rows.length) {
      const timer = setTimeout(() => {
        setVisibleRows(prev => prev + 1)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [csvData, visibleRows])

  // Initialize React Table
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  })

  const memoizedTable = useMemo(() => table, [table])

  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId],
    }))
  }

  // Show loader while data is being fetched
  if (!csvData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Data Viewer</h1>
        <p className="text-gray-600">Displaying data in a table format with animated row loading</p>
      </header>

      {tableData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TableIcon className="w-5 h-5" />
              Table View
            </h2>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
              <span className="text-sm text-gray-600">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Column Visibility</h3>
            <div className="flex flex-wrap gap-2">
              {columns.map((column) => (
                <label key={column.accessorKey as string} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={columnVisibility[column.accessorKey as string] || false}
                    onChange={() => toggleColumnVisibility(column.accessorKey as string)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm">{column.header as string}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                {memoizedTable.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-2 text-left text-sm font-medium text-gray-200 border">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {memoizedTable.getRowModel().rows.slice(0, visibleRows).map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 text-sm text-gray-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="border rounded px-2 py-1 text-sm text-gray-900"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 text-sm text-gray-200 border rounded hover:bg-gray-50 disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 text-sm text-gray-200 border rounded hover:bg-gray-50 disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
