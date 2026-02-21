import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { SidebarItem } from './ui/SidebarItem'
import { UserProfileModal } from './UserProfileModal'
import { useToast } from '../hooks/useToast'
import logoWithoutBackground from '../assets/logo-without-background.png'

interface SidebarProps {
  open?: boolean
  onClose?: () => void
  isMobile?: boolean
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const { ToastContainer } = useToast()

  const handleLogout = async () => {
    onNavigate?.()
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Logo/Header */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex justify-center">
          <img
            alt="ARU CRM"
            src={logoWithoutBackground}
            className="mx-auto h-48 w-auto"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarItem to="/" onNavigate={onNavigate}>
          Dashboard
        </SidebarItem>
        <SidebarItem to="/athletes" onNavigate={onNavigate}>
          Atletas
        </SidebarItem>
        <SidebarItem to="/users" onNavigate={onNavigate}>
          Usuários
        </SidebarItem>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-neutral-800">
        {user && (
          <div className="mb-3">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-neutral-800 transition-colors text-left group min-h-[44px]"
            >
              <div className="p-2 bg-primary-600/20 rounded-lg group-hover:bg-primary-600/30 transition-colors">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-100 truncate">{user.name || user.email}</p>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
              </div>
            </button>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 rounded-md transition-colors min-h-[44px]"
        >
          Sair
        </button>
      </div>

      <UserProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
      <ToastContainer />
    </>
  )
}

export function Sidebar({ open = false, onClose, isMobile = false }: SidebarProps) {
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {open && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            aria-hidden
            onClick={onClose}
          />
        )}
        {/* Drawer */}
        <aside
          className={`
            fixed left-0 top-0 h-full w-64 max-w-[85vw] bg-neutral-900 border-r border-neutral-800 flex flex-col z-50
            transform transition-transform duration-200 ease-out md:hidden
            ${open ? 'translate-x-0' : '-translate-x-full'}
          `}
          aria-label="Menu"
        >
          <SidebarContent onNavigate={onClose} />
        </aside>
      </>
    )
  }

  return (
    <aside className="w-64 max-md:hidden flex-shrink-0 bg-neutral-900 border-r border-neutral-800 flex flex-col h-screen">
      <SidebarContent />
    </aside>
  )
}
