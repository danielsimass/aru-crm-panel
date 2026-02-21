import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface SidebarItemProps {
  to: string
  children: ReactNode
  icon?: ReactNode
  onNavigate?: () => void
}

export function SidebarItem({ to, children, icon, onNavigate }: SidebarItemProps) {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`)
  
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-primary-600 text-white' 
          : 'text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100'
        }
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </Link>
  )
}
