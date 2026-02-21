import { ReactNode } from 'react'
import { Pagination, PaginationInfo } from './Pagination'

export interface Column<T> {
  key: string
  label: string
  render?: (value: unknown, row: T) => ReactNode
  className?: string
}


export interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  pagination?: PaginationInfo
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  pagination,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado',
}: TableProps<T>) {
  const renderCell = (column: Column<T>, row: T) => {
    const value = row[column.key]
    
    if (column.render) {
      return column.render(value, row)
    }
    
    return value as ReactNode
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border border-neutral-800 sm:rounded-lg">
              <table className="relative min-w-full divide-y divide-neutral-800">
                <thead className="bg-neutral-900">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className={`py-3.5 px-3 text-left text-sm font-semibold text-neutral-200 ${
                          column.className || ''
                        }`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 bg-neutral-900/50">
                  {data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="py-12 text-center text-sm text-neutral-400"
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  ) : (
                    data.map((row, index) => (
                      <tr
                        key={index}
                        className={onRowClick ? 'cursor-pointer hover:bg-neutral-800/50' : ''}
                        onClick={() => onRowClick?.(row)}
                      >
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={`py-4 px-3 text-sm whitespace-nowrap text-neutral-300 ${
                              column.className || ''
                            }`}
                          >
                            {renderCell(column, row)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {pagination && (
        <div className="mt-6">
          <Pagination pagination={pagination} />
        </div>
      )}
    </div>
  )
}
