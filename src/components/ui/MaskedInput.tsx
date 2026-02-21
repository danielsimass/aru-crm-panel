import { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react'
import { maskPhone, maskCpf, maskDate, dateMaskToISO, dateISOToMask } from '../../lib/masks'

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string
  error?: string
  mask?: 'phone' | 'cpf' | 'date'
  value?: string
  onChange?: (value: string) => void
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ label, error, mask, value = '', onChange, className = '', ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('')

    useEffect(() => {
      if (mask === 'date') {
        // Para data, converte ISO para máscara para exibição
        setDisplayValue(value ? dateISOToMask(value) : '')
      } else {
        // Para telefone e CPF, aplica máscara diretamente
        if (mask === 'phone') {
          setDisplayValue(maskPhone(value))
        } else if (mask === 'cpf') {
          setDisplayValue(maskCpf(value))
        } else {
          setDisplayValue(value)
        }
      }
    }, [value, mask])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      let newValue = inputValue

      if (mask === 'phone') {
        newValue = maskPhone(inputValue)
        // Retorna apenas dígitos para o onChange (sem máscara)
        onChange?.(inputValue.replace(/\D/g, ''))
      } else if (mask === 'cpf') {
        newValue = maskCpf(inputValue)
        // Retorna apenas dígitos para o onChange (sem máscara)
        onChange?.(inputValue.replace(/\D/g, ''))
      } else if (mask === 'date') {
        newValue = maskDate(inputValue)
        // Converte para ISO (YYYY-MM-DD) para o onChange
        const isoDate = dateMaskToISO(newValue)
        onChange?.(isoDate)
      } else {
        onChange?.(inputValue)
      }

      setDisplayValue(newValue)
    }

    return (
      <div className="flex-1 min-w-[200px]">
        {label && (
          <label className="block text-sm font-medium text-neutral-100 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          value={displayValue}
          onChange={handleChange}
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

MaskedInput.displayName = 'MaskedInput'
