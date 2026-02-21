import { ReactNode } from 'react'

interface TableFiltersProps {
  children: ReactNode
  className?: string
}

export function TableFilters({ children, className = '' }: TableFiltersProps) {
  return (
    <div className={`mb-6 px-4 sm:px-6 lg:px-8 flex flex-wrap items-end gap-4 ${className}`}>
      {children}
    </div>
  )
}
