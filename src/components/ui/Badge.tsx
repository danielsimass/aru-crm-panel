import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'accent' | 'neutral'
  className?: string
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  const variantClasses = {
    primary: 'bg-primary-600/20 text-primary-400 border border-primary-600/30',
    accent: 'bg-accent-500/20 text-accent-400 border border-accent-500/30',
    neutral: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
  }
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
