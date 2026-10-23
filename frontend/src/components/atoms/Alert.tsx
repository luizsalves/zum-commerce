import type { ReactNode } from 'react'

const TONES = {
  error: 'bg-red-50 text-red-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-800',
} as const

export function Alert({ tone = 'error', className = '', children }: { tone?: keyof typeof TONES; className?: string; children: ReactNode }) {
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl p-3 text-sm ${TONES[tone]} ${className}`}>
      {children}
    </p>
  )
}
