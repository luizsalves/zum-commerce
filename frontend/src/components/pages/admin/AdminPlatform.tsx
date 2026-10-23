import { useState, type FormEvent } from 'react'
import { useAdmin } from '../../../contexts/AdminContext'
import { api } from '../../../lib/api'
import { Alert } from '../../atoms/Alert'
import { Field } from '../../atoms/Field'

/** Área da Zum: cadastrar lojas de clientes, liberar acesso ao painel e testar a conexão com a Shopify. */
export function AdminPlatform() {
  const { me, reloadMe } = useAdmin()

  if (!me.platformAdmin) return <p className="text-sm text-stone-500">Área restrita à equipe da plataforma.</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Plataforma</h1>
        <p className="text-sm text-stone-500">Lojas dos clientes da Zum e quem pode acessar o painel de cada uma.</p>
      </div>

      <div className="card divide-y divide-stone-100">
        {me.tenants.length === 0 && <p className="p-4 text-sm text-stone-500">Nenhuma loja cadastrada.</p>}
        {me.tenants.map((t) => (
          <TenantRow key={t.id} id={t.id} name={t.name} shopDomain={t.shopDomain} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CreateTenant onCreated={reloadMe} />
        <AddMember tenants={me.tenants} />
      </div>
    </div>
  )
}

type ShopPublication = { id: string; name: string; selected: boolean }
type ShopInfo = { name: string; myshopifyDomain: string; planName?: string | null; publications: ShopPublication[] }

function TenantRow({ id, name, shopDomain }: { id: string; name: string; shopDomain: string }) {
  const [result, setResult] = useState<string | null>(null)
  const [publications, setPublications] = useState<ShopPublication[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [pubMsg, setPubMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const test = async () => {
    setBusy(true)
    setResult(null)
    setPubMsg(null)
    try {
      const shop = await api<ShopInfo>(`/api/platform/tenants/${id}/test`, { method: 'POST' })
      setResult(`Conectado: ${shop.name}${shop.planName ? ` (plano ${shop.planName})` : ''}`)
      setPublications(shop.publications)
    } catch (e) {
      setResult(`Falhou: ${(e as Error).message}`)
      setPublications(null)
    } finally {
      setBusy(false)
    }
  }

  const toggle = (pubId: string) =>
    setPublications((list) => list?.map((p) => (p.id === pubId ? { ...p, selected: !p.selected } : p)) ?? null)

  const savePublications = async () => {
    if (!publications) return
    setBusy(true)
    setPubMsg(null)
    try {
      await api(`/api/platform/tenants/${id}/publications`, {
        method: 'PUT',
        body: { publicationIds: publications.filter((p) => p.selected).map((p) => p.id) },
      })
      setPubMsg({ ok: true, text: 'Canais salvos. Os próximos produtos salvos serão publicados neles.' })
    } catch (e) {
      setPubMsg({ ok: false, text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <p className="font-medium">{name}</p>
          <p className="text-xs text-stone-500">
            {id} · {shopDomain}
          </p>
          {result && <p className="mt-1 text-xs text-stone-600">{result}</p>}
        </div>
        <button className="btn-ghost py-1.5" disabled={busy} onClick={test}>
          {busy ? 'Aguarde…' : 'Testar conexão'}
        </button>
      </div>

      {publications && (
        <div className="rounded-lg bg-stone-50 p-3">
          <p className="text-xs font-medium text-stone-700">Canais de vendas onde os produtos aparecem</p>
          <p className="mb-2 text-xs text-stone-500">
            Marque o canal do token Storefront do site (normalmente &quot;Headless&quot;). Sem canal marcado, o produto não aparece
            na vitrine.
          </p>
          {publications.length === 0 && <p className="text-xs text-stone-500">A loja não tem canais de vendas.</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {publications.map((p) => (
              <label key={p.id} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={p.selected} onChange={() => toggle(p.id)} />
                {p.name}
              </label>
            ))}
          </div>
          {pubMsg && (
            <Alert tone={pubMsg.ok ? 'success' : 'error'} className="mt-2">
              {pubMsg.text}
            </Alert>
          )}
          <button className="btn-primary mt-2 py-1.5" disabled={busy} onClick={savePublications}>
            Salvar canais
          </button>
        </div>
      )}
    </div>
  )
}

function CreateTenant({ onCreated }: { onCreated: () => Promise<void> }) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    shopDomain: '',
    storefrontToken: '',
    clientId: '',
    clientSecret: '',
    domains: '',
    primaryColor: '#c2416c',
    whatsapp: '',
  })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      await api('/api/platform/tenants', {
        body: {
          ...form,
          domains: form.domains.split(',').map((d) => d.trim()).filter(Boolean),
          whatsapp: form.whatsapp || null,
        },
      })
      setMsg({ ok: true, text: 'Loja cadastrada. Use "Testar conexão" para conferir as credenciais.' })
      setForm((f) => ({ ...f, id: '', name: '', shopDomain: '', storefrontToken: '', clientId: '', clientSecret: '', domains: '' }))
      await onCreated()
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <h2 className="font-medium">Cadastrar loja de cliente</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="ID (sem espaços)">
          <input className="input" value={form.id} onChange={set('id')} placeholder="elika" required />
        </Field>
        <Field label="Nome da loja">
          <input className="input" value={form.name} onChange={set('name')} placeholder="Elika Tiaras e Laços" required />
        </Field>
      </div>
      <Field label="Domínio Shopify">
        <input className="input" value={form.shopDomain} onChange={set('shopDomain')} placeholder="elika.myshopify.com" required />
      </Field>
      <Field label="Storefront token (público)">
        <input className="input" value={form.storefrontToken} onChange={set('storefrontToken')} required />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Client ID (Dev Dashboard)">
          <input className="input" value={form.clientId} onChange={set('clientId')} required />
        </Field>
        <Field label="Client Secret">
          <input className="input" type="password" value={form.clientSecret} onChange={set('clientSecret')} required />
        </Field>
      </div>
      <Field label="Domínios do site (separados por vírgula)">
        <input className="input" value={form.domains} onChange={set('domains')} placeholder="loja.elika.com.br" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Cor da marca">
          <input className="input h-10 p-1" type="color" value={form.primaryColor} onChange={set('primaryColor')} />
        </Field>
        <Field label="WhatsApp (opcional)">
          <input className="input" value={form.whatsapp} onChange={set('whatsapp')} placeholder="5535999999999" />
        </Field>
      </div>
      {msg && <Alert tone={msg.ok ? 'success' : 'error'}>{msg.text}</Alert>}
      <button disabled={busy} className="btn-primary">
        {busy ? 'Cadastrando…' : 'Cadastrar loja'}
      </button>
      <p className="text-xs text-stone-400">O Client Secret é guardado criptografado e nunca volta para o navegador.</p>
    </form>
  )
}

function AddMember({ tenants }: { tenants: { id: string; name: string }[] }) {
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? '')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'owner'>('owner')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      await api(`/api/platform/tenants/${tenantId}/members`, { body: { email, role } })
      setMsg({ ok: true, text: `${email} agora acessa o painel da loja.` })
      setEmail('')
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <h2 className="font-medium">Liberar acesso ao painel</h2>
      <p className="text-xs text-stone-500">
        A pessoa precisa ter entrado no painel pelo menos uma vez (com Google ou e-mail) para a conta existir.
      </p>
      <Field label="Loja">
        <select className="input" value={tenantId} onChange={(e) => setTenantId(e.target.value)} required>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="E-mail do lojista">
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Field>
      <Field label="Papel">
        <select className="input" value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'owner')}>
          <option value="owner">Dono da loja</option>
          <option value="admin">Funcionário</option>
        </select>
      </Field>
      {msg && <Alert tone={msg.ok ? 'success' : 'error'}>{msg.text}</Alert>}
      <button disabled={busy || !tenantId} className="btn-primary">
        {busy ? 'Liberando…' : 'Liberar acesso'}
      </button>
    </form>
  )
}
