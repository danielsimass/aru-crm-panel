import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  /** sm: 28rem, md: 32rem, lg: 56rem, xl: 72rem */
  size?: 'sm' | 'md' | 'lg' | 'xl'
}


export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden
        onClick={onClose}
      />
      <div
        className={`
          relative w-full rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl
          outline outline-1 -outline-offset-1 outline-white/10 max-h-[90vh] flex flex-col
          sm:max-w-lg
          max-sm:fixed max-sm:inset-0 max-sm:max-h-none max-sm:rounded-none max-sm:border-0
          ${size === 'sm' ? 'sm:max-w-sm' : ''}
          ${size === 'lg' ? 'sm:max-w-4xl' : ''}
          ${size === 'xl' ? 'sm:max-w-6xl' : ''}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="px-4 py-4 sm:px-6 border-b border-neutral-800">
          <h2 id="modal-title" className="text-lg font-semibold text-neutral-100">
            {title}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {children}
        </div>
        {footer != null && (
          <div className="flex items-center justify-end gap-3 border-t border-neutral-800 px-4 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
