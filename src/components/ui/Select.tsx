import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="flex-1 min-w-[200px]">
        {label && (
          <label className="block text-sm font-medium text-neutral-100 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`block w-full rounded-md bg-neutral-900 border ${
            error ? 'border-error-500' : 'border-neutral-800'
          } px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-error-500">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
