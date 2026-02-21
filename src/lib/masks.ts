/**
 * Funções de máscara para inputs
 */

/**
 * Máscara de telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d)/, '$1$2-$3')
  } else {
    // Celular: (XX) XXXXX-XXXX
    return digits
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
  }
}

/**
 * Máscara de CPF: XXX.XXX.XXX-XX
 */
export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

/**
 * Máscara de data: DD/MM/YYYY
 */
export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) {
    return digits
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  } else {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  }
}

/**
 * Remove máscara (mantém apenas dígitos)
 */
export function unmask(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Converte data formatada DD/MM/YYYY para YYYY-MM-DD
 */
export function dateMaskToISO(maskedDate: string): string {
  const digits = unmask(maskedDate)
  if (digits.length !== 8) return ''
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  // Validação básica
  const dayNum = parseInt(day, 10)
  const monthNum = parseInt(month, 10)
  const yearNum = parseInt(year, 10)
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900) {
    return ''
  }
  return `${year}-${month}-${day}`
}

/**
 * Converte data ISO YYYY-MM-DD para formato de máscara DD/MM/YYYY
 */
export function dateISOToMask(isoDate: string): string {
  if (!isoDate || isoDate.length !== 10) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}
