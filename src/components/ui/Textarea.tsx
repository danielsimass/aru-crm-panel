import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex-1 min-w-[200px]">
        {label && (
          <label className="block text-sm font-medium text-neutral-100 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`block w-full rounded-md bg-neutral-900 border ${
            error ? 'border-error-500' : 'border-neutral-800'
          } px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error-500">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
