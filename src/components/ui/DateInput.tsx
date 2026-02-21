import { forwardRef, useState, useEffect, useRef } from 'react'
import DatePicker, { DatePickerProps } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ptBR } from 'date-fns/locale'
import { maskDate, dateMaskToISO, dateISOToMask } from '../../lib/masks'

export interface DateInputProps
  extends Omit<DatePickerProps, 'selected' | 'onChange' | 'locale' | 'value' | 'customInput' | 'selectsRange'> {
  label?: string
  error?: string
  value?: string
  onChange?: (value: string) => void
}

function parseDate(s: string | undefined): Date | null {
  if (!s?.trim()) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function formatDate(d: Date | null): string {
  if (!d) return ''
  return d.toISOString().slice(0, 10)
}

export const DateInput = forwardRef<DatePicker, DateInputProps>(
  ({ label, error, value, onChange, disabled, className = '', placeholderText, ...props }, ref) => {
    const selected = parseDate(value)
    const [textValue, setTextValue] = useState('')
    const [showPicker, setShowPicker] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      setTextValue(value ? dateISOToMask(value) : '')
    }, [value])

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = maskDate(e.target.value)
      setTextValue(masked)
      const isoDate = dateMaskToISO(masked)
      if (isoDate) {
        onChange?.(isoDate)
      } else if (masked.length === 0) {
        onChange?.('')
      }
    }

    return (
      <div className="flex-1 min-w-[200px]">
        {label && (
          <label className="block text-sm font-medium text-neutral-100 mb-2">
            {label}
          </label>
        )}
        <div className="relative date-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={textValue}
            onChange={handleTextChange}
            placeholder={placeholderText || 'dd/mm/aaaa'}
            disabled={disabled}
            maxLength={10}
            className={`block w-full rounded-md bg-neutral-900 border ${
              error ? 'border-error-500' : 'border-neutral-800'
            } px-3 py-2 pr-10 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 ${className}`}
          />
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 disabled:opacity-50 z-10"
            tabIndex={-1}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          {showPicker && (
            <div className="absolute z-50 mt-1 datepicker-container" style={{ left: 0 }}>
              {/* @ts-expect-error - DatePicker onChange type is complex, we handle Date | null correctly */}
              <DatePicker
                ref={ref}
                selected={selected}
                onChange={(d: Date | null) => {
                  onChange?.(formatDate(d))
                  setShowPicker(false)
                }}
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
                disabled={disabled}
                open={true}
                onSelect={() => setShowPicker(false)}
                onClickOutside={() => setShowPicker(false)}
                calendarClassName="datepicker-dark"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                {...props}
              />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error-500">{error}</p>
        )}
      </div>
    )
  }
)

DateInput.displayName = 'DateInput'
