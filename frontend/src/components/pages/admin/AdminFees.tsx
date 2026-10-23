import { useEffect, useState, type FormEvent } from 'react'
import { useAdmin } from '../../../contexts/AdminContext'
import { RequireTenant } from '../../molecules/RequireTenant'
import { FeeSimulator } from '../../organisms/FeeSimulator'
import { DEFAULT_FEES, SHOPIFY_PLAN_PCT, type FeeSettings } from '../../../lib/fees'
import { loadFees, saveFees } from '../../../lib/feesStore'
import { Alert } from '../../atoms/Alert'
import { Field } from '../../atoms/Field'
import { FEE_FIELDS, SHOPIFY_PLANS, type FeeNumberField } from '../../../data/fees'

export function AdminFees() {
  return (
    <RequireTenant>
      <FeesForm />
    </RequireTenant>
  )
}

function FeesForm() {
  const { tenantId } = useAdmin()
  const [fees, setFees] = useState<FeeSettings>(DEFAULT_FEES)
  const [texts, setTexts] = useState<Record<FeeNumberField, string>>({ creditPct: '', credit12Pct: '', pixPct: '', boletoFixed: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    setLoading(true)
    loadFees(tenantId)
      .then((f) => {
        setFees(f)
        setTexts({
          creditPct: String(f.creditPct).replace('.', ','),
          credit12Pct: String(f.credit12Pct).replace('.', ','),
          pixPct: String(f.pixPct).replace('.', ','),
          boletoFixed: String(f.boletoFixed).replace('.', ','),
        })
      })
      .catch((e: Error) => setMsg({ ok: false, text: e.message }))
      .finally(() => setLoading(false))
  }, [tenantId])

  const setText = (key: FeeNumberField, value: string) => {
    setTexts((t) => ({ ...t, [key]: value }))
    const n = Number(value.replace(',', '.'))
    if (Number.isFinite(n) && n >= 0) setFees((f) => ({ ...f, [key]: n }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      await saveFees(tenantId, fees)
      setMsg({ ok: true, text: 'Taxas salvas. O simulador do cadastro de produtos já usa os novos valores.' })
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-stone-500">Carregando…</p>

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <form onSubmit={onSubmit} className="card space-y-5 p-5">
        <div>
          <h1 className="font-display text-3xl">Taxas</h1>
          <p className="mt-1 text-sm text-stone-500">
            Copie os valores do painel do seu meio de pagamento. As taxas são individuais de cada lojista e mudam com o
            prazo de recebimento escolhido.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Plano da Shopify" hint="Cobrada pela Shopify por usar gateway externo.">
            <select
              className="input"
              value={fees.shopifyPlan}
              onChange={(e) => {
                const plan = e.target.value as FeeSettings['shopifyPlan']
                setFees((f) => ({ ...f, shopifyPlan: plan, shopifyPct: SHOPIFY_PLAN_PCT[plan] }))
              }}
            >
              {SHOPIFY_PLANS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Meio de pagamento">
            <input className="input" value={fees.gateway} onChange={(e) => setFees((f) => ({ ...f, gateway: e.target.value }))} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEE_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint || undefined}>
              <div className="flex items-center gap-2">
                {f.unit === 'R$' && <span className="text-sm text-stone-500">R$</span>}
                <input
                  className="input"
                  inputMode="decimal"
                  value={texts[f.key]}
                  onChange={(e) => setText(f.key, e.target.value)}
                />
                {f.unit === '%' && <span className="text-sm text-stone-500">%</span>}
              </div>
            </Field>
          ))}
        </div>

        {msg && <Alert tone={msg.ok ? 'success' : 'error'}>{msg.text}</Alert>}

        <button disabled={saving} className="btn-primary">
          {saving ? 'Salvando…' : 'Salvar taxas'}
        </button>
      </form>

      <aside className="space-y-2">
        <p className="text-xs text-stone-500">Exemplo: produto de R$ 100,00 com custo de R$ 40,00</p>
        <FeeSimulator price={100} cost={40} fees={{ ...fees, configured: true }} />
      </aside>
    </div>
  )
}
