import { ReactNode, useState } from 'react'
import { Sidebar } from './Sidebar'
import { useMediaQuery } from '../hooks/useMediaQuery'
import logoWithoutBackground from '../assets/logo-without-background.png'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-neutral-950">
      {/* Mobile header: logo + hamburger (só em telas pequenas) */}
      <header className="md:hidden flex items-center gap-3 h-14 px-4 border-b border-neutral-800 flex-shrink-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-md text-neutral-300 hover:bg-neutral-800 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src={logoWithoutBackground} alt="ARU CRM" className="h-8 w-auto" />
      </header>

      <div className="flex flex-1 min-h-0">
        <Sidebar
          isMobile={!isDesktop}
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
