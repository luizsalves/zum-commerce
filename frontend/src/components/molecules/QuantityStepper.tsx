type Props = {
  value: number
  onChange: (value: number) => void
  min?: number
  disabled?: boolean
  size?: 'sm' | 'md'
}

/** Botões − / + de quantidade (carrinho e página de produto). */
export function QuantityStepper({ value, onChange, min = 1, disabled, size = 'md' }: Props) {
  const pad = size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-2.5'
  return (
    <div className="flex items-center rounded-full border border-stone-300 bg-white">
      <button disabled={disabled} className={pad} onClick={() => onChange(Math.max(min, value - 1))} aria-label="Diminuir">
        −
      </button>
      <span className={`text-center ${size === 'sm' ? 'w-6 text-sm' : 'w-6'}`}>{value}</span>
      <button disabled={disabled} className={pad} onClick={() => onChange(value + 1)} aria-label="Aumentar">
        +
      </button>
    </div>
  )
}
