export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={`h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-brand ${className}`}
    />
  )
}
