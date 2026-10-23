import type { ReactNode } from 'react'

/** Mensagem centralizada de tela inteira (carregando, erro, sem acesso). */
export function CenterMessage({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-stone-50 px-4 text-center">
      <div>
        <p className="font-display text-2xl">{title}</p>
        {text && <p className="mx-auto mt-2 max-w-sm text-sm text-stone-500">{text}</p>}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  )
}
