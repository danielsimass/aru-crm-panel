interface PasswordRequirementsProps {
  password: string
  className?: string
}

const requirements = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Pelo menos uma letra', test: (p: string) => /[a-zA-ZÀ-ÿ]/.test(p) },
  { label: 'Pelo menos um número', test: (p: string) => /\d/.test(p) },
]

export function PasswordRequirements({ password, className = '' }: PasswordRequirementsProps) {
  return (
    <ul className={`text-sm space-y-1 ${className}`}>
      {requirements.map(({ label, test }) => {
        const met = test(password)
        return (
          <li
            key={label}
            className={`flex items-center gap-2 transition-colors ${
              met ? 'text-green-500' : 'text-error-500'
            }`}
          >
            <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
              {met ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="block w-2 h-2 rounded-full bg-current" />
              )}
            </span>
            <span>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}
