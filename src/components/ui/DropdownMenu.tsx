import { useState, useRef, useEffect, ReactNode, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

interface DropdownMenuItem {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

interface DropdownMenuProps {
  items: DropdownMenuItem[]
  children?: ReactNode
}

export function DropdownMenu({ items, children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuWidth = 192 // w-48

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedInsideMenu = !!menuRef.current?.contains(target)
      const clickedInsideRoot = !!rootRef.current?.contains(target)
      if (!clickedInsideMenu && !clickedInsideRoot) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, items.length])

  const measureAndPosition = () => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const estimatedMenuHeight = items.length * 40 + 16 // aproximação ok p/ cálculo de direção
    const shouldOpenUp = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight
    setOpenUpward(shouldOpenUp)

    const top = shouldOpenUp ? rect.top - estimatedMenuHeight - 8 : rect.bottom + 8
    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8,
    )
    setCoords({ top: Math.max(8, top), left })
  }

  useLayoutEffect(() => {
    if (!isOpen) return
    measureAndPosition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, items.length])

  useEffect(() => {
    if (!isOpen) return
    const handle = () => measureAndPosition()
    window.addEventListener('scroll', handle, true)
    window.addEventListener('resize', handle)
    return () => {
      window.removeEventListener('scroll', handle, true)
      window.removeEventListener('resize', handle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, items.length])

  const handleItemClick = (item: DropdownMenuItem) => {
    item.onClick()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
        aria-label="Menu de ações"
      >
        {children || (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[1000] w-48 rounded-md bg-neutral-900 border border-neutral-800 shadow-lg focus:outline-none"
            style={{ top: coords.top, left: coords.left }}
          >
            <div className="py-1" role="menu">
              {items.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleItemClick(item)
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    item.variant === 'danger'
                      ? 'text-error-500 hover:bg-error-500/10 hover:text-error-400'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100'
                  }`}
                  role="menuitem"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
