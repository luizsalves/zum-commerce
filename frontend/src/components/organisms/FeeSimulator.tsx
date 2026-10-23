import { useState } from 'react'
import { Link } from 'react-router-dom'
import { brl, parseMoney, pct } from '../../lib/format'
import { priceForNet, simulate, type FeeSettings } from '../../lib/fees'
import { paths } from '../../routes/paths'

type Props = {
  price: number
  cost: number
  fees: FeeSettings & { configured: boolean }
  onUsePrice?: (price: number) => void
}

/** Mostra, enquanto o lojista digita, quanto sobra de cada venda depois das taxas. */
export function FeeSimulator({ price, cost, fees, onUsePrice }: Props) {
  const [desired, setDesired] = useState('')
  const rows = simulate(price, cost, fees)
  const desiredNet = parseMoney(desired)
  const suggested = desiredNet ? priceForNet(desiredNet, fees.creditPct, fees) : null

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-medium">Quanto você recebe</h3>
        <span className="text-xs text-stone-500">
          Shopify {pct(fees.shopifyPct)} + {fees.gateway}
        </span>
      </div>

      {!fees.configured && (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          As taxas do seu gateway ainda não foram configuradas, então só a taxa da Shopify está sendo descontada.{' '}
          <Link to={paths.admin.fees} className="font-medium underline">
            Configurar taxas
          </Link>
        </p>
      )}

      {price <= 0 ? (
        <p className="mt-4 text-sm text-stone-500">Digite o preço para ver a simulação.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="pb-2 font-medium">Pagamento</th>
                <th className="pb-2 text-right font-medium">Taxas</th>
                <th className="pb-2 text-right font-medium">Recebe</th>
                <th className="pb-2 text-right font-medium">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((r) => (
                <tr key={r.key}>
                  <td className="py-2">{r.label}</td>
                  <td className="py-2 text-right text-stone-500">− {brl(r.shopifyFee + r.gatewayFee)}</td>
                  <td className="py-2 text-right font-medium">{brl(r.net)}</td>
                  <td className={`py-2 text-right font-medium ${r.profit < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {cost > 0 ? `${brl(r.profit)} (${pct(r.margin)})` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cost <= 0 && <p className="mt-2 text-xs text-stone-500">Informe o custo do produto para ver o lucro.</p>}
        </div>
      )}

      <div className="mt-5 border-t border-stone-100 pt-4">
        <label className="label">Quero receber no cartão à vista</label>
        <div className="flex items-center gap-2">
          <input
            className="input"
            inputMode="decimal"
            placeholder="R$ 75,00"
            value={desired}
            onChange={(e) => setDesired(e.target.value)}
          />
          {suggested !== null && suggested > 0 && (
            <button type="button" className="btn-ghost shrink-0" onClick={() => onUsePrice?.(suggested)}>
              Cobrar {brl(suggested)}
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-stone-400">
        Simulação por produto. A taxa da Shopify incide sobre o total do pedido (incluindo frete), então o valor real de
        cada venda pode variar um pouco.
      </p>
    </div>
  )
}
