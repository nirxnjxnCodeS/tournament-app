'use client'

import { type ReactNode, useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Prevent closing by clicking overlay or pressing Escape */
  persistent?: boolean
}

export function Modal({ open, onClose, title, children, persistent = false }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
    } else {
      if (el.open) el.close()
    }
  }, [open])

  useEffect(() => {
    const el = dialogRef.current
    if (!el || persistent) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [onClose, persistent])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (persistent) return
    const rect = dialogRef.current?.getBoundingClientRect()
    if (!rect) return
    const outside =
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom
    if (outside) onClose()
  }

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={[
        // Backdrop
        'backdrop:bg-black/60',
        // Reset dialog styles
        'p-0 rounded-card bg-surface border border-border',
        // Width
        'w-full max-w-md mx-auto',
        // Position — slides up on mobile
        'fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2',
        'rounded-b-none sm:rounded-b-card',
        // Shadow
        'shadow-modal',
        // Animate in
        'animate-slide-up',
      ].join(' ')}
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 id="modal-title" className="text-base font-semibold text-text">
          {title}
        </h2>
        {!persistent && (
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors p-1 -mr-1 rounded"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </dialog>
  )
}
