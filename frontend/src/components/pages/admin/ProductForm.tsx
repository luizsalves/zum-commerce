import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAdmin } from '../../../contexts/AdminContext'
import { RequireTenant } from '../../molecules/RequireTenant'
import { FeeSimulator } from '../../organisms/FeeSimulator'
import { api } from '../../../lib/api'
import { DEFAULT_FEES, type FeeSettings } from '../../../lib/fees'
import { loadFees } from '../../../lib/feesStore'
import { storage } from '../../../lib/firebase'
import { parseMoney } from '../../../lib/format'
import { PRODUCT_STATUS } from '../../../data/productStatus'
import type { Product, ProductImage, ProductStatus } from '../../../types'
import { Alert } from '../../atoms/Alert'
import { htmlToText, textToHtml } from '../../../lib/richText'
import { cleanOptions, emptyRow, keyOf, syncVariants, type OptionRow, type VariantRow } from '../../../lib/variants'

const toStr = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n).replace('.', ','))

export function ProductForm() {
  return (
    <RequireTenant>
      <ProductFormInner />
    </RequireTenant>
  )
}

function ProductFormInner() {
  const { tenantId } = useAdmin()
  const [params] = useSearchParams()
  const productId = params.get('id')
  const navigate = useNavigate()

  const [loading, setLoading] = useState(!!productId)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [vendor, setVendor] = useState('')
  const [productType, setProductType] = useState('')
  const [tags, setTags] = useState('')
  const [status, setStatus] = useState<ProductStatus>('ACTIVE')
  const [images, setImages] = useState<ProductImage[]>([])
  const [optionRows, setOptionRows] = useState<OptionRow[]>([])
  const [variants, setVariants] = useState<VariantRow[]>([emptyRow()])
  const [simIndex, setSimIndex] = useState(0)
  const [fees, setFees] = useState<FeeSettings & { configured: boolean }>({ ...DEFAULT_FEES, configured: false })

  useEffect(() => {
    loadFees(tenantId).then(setFees).catch(() => undefined)
  }, [tenantId])

  const fill = (p: Product) => {
    setTitle(p.title)
    setDescription(htmlToText(p.descriptionHtml))
    setVendor(p.vendor ?? '')
    setProductType(p.productType ?? '')
    setTags(p.tags.join(', '))
    setStatus(p.status)
    setImages(p.images)
    const opts = p.options.map((o) => ({ name: o.name, valuesText: o.values.join(', ') }))
    setOptionRows(opts)
    const names = p.options.map((o) => o.name)
    setVariants(
      p.variants.map((v) => ({
        key: keyOf(v.options, names),
        id: v.id,
        options: v.options,
        price: toStr(v.price),
        compareAtPrice: toStr(v.compareAtPrice),
        cost: toStr(v.cost),
        sku: v.sku ?? '',
        quantity: v.quantity === null ? '' : String(v.quantity),
        weightGrams: v.weightGrams === null ? '' : String(v.weightGrams),
      })),
    )
  }

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    api<Product>(`/api/admin/product?id=${encodeURIComponent(productId)}`, { tenantId })
      .then(fill)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, tenantId])

  const optionNames = useMemo(() => cleanOptions(optionRows).map((o) => o.name), [optionRows])
  const hasOptions = optionNames.length > 0

  const updateOptions = (rows: OptionRow[]) => {
    setOptionRows(rows)
    setVariants((current) => syncVariants(rows, current))
    setSimIndex(0)
  }

  const updateVariant = (index: number, patch: Partial<VariantRow>) =>
    setVariants((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))

  const applyToAll = (field: 'price' | 'compareAtPrice' | 'cost' | 'weightGrams' | 'quantity', value: string) =>
    setVariants((rows) => rows.map((r) => ({ ...r, [field]: value })))

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError(null)
    try {
      const uploaded: ProductImage[] = []
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
        const fileRef = ref(storage, `tenants/${tenantId}/products/${crypto.randomUUID()}-${safeName}`)
        await uploadBytes(fileRef, file, { contentType: file.type })
        uploaded.push({ id: null, url: await getDownloadURL(fileRef), alt: title || null })
      }
      setImages((prev) => [...prev, ...uploaded])
    } catch (e) {
      setError('Falha ao enviar a imagem: ' + (e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const moveImage = (index: number, dir: -1 | 1) =>
    setImages((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSavedMsg(null)

    const options = cleanOptions(optionRows)
    const built = variants.map((v) => ({
      id: v.id,
      options: hasOptions ? v.options : {},
      price: parseMoney(v.price),
      compareAtPrice: parseMoney(v.compareAtPrice),
      cost: parseMoney(v.cost),
      sku: v.sku.trim() || null,
      quantity: v.quantity.trim() === '' ? null : Math.max(0, Math.floor(Number(v.quantity))),
      weightGrams: v.weightGrams.trim() === '' ? null : Number(v.weightGrams.replace(',', '.')),
    }))

    if (built.some((v) => v.price === null)) {
      setError('Preencha o preço de todas as variações.')
      return
    }

    const payload: Product = {
      id: productId,
      title: title.trim(),
      descriptionHtml: textToHtml(description),
      vendor: vendor.trim() || null,
      productType: productType.trim() || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status,
      options,
      variants: built.map((v) => ({ ...v, price: v.price ?? 0 })),
      images,
    }

    setSaving(true)
    try {
      const saved = await api<Product>('/api/admin/product', { tenantId, body: payload })
      fill(saved)
      setSavedMsg('Produto salvo na Shopify.')
      if (!productId && saved.id) navigate(`/admin/produto?id=${encodeURIComponent(saved.id)}`, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const simRow = variants[simIndex] ?? variants[0]
  const simPrice = parseMoney(simRow?.price ?? '') ?? 0
  const simCost = parseMoney(simRow?.cost ?? '') ?? 0

  if (loading) return <p className="text-sm text-stone-500">Carregando produto…</p>

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="text-sm text-stone-500 hover:underline">
            ← Produtos
          </Link>
          <h1 className="font-display text-3xl">{productId ? title || 'Editar produto' : 'Novo produto'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)}>
            {(Object.keys(PRODUCT_STATUS) as ProductStatus[]).map((s) => (
              <option key={s} value={s}>
                {PRODUCT_STATUS[s].option}
              </option>
            ))}
          </select>
          <button disabled={saving || uploading} className="btn-primary">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}
      {savedMsg && <Alert tone="success">{savedMsg}</Alert>}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <div>
              <label className="label">Nome do produto</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea
                className="input min-h-32"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Materiais, medidas, cuidados… Deixe uma linha em branco entre parágrafos."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Categoria</label>
                <input className="input" value={productType} onChange={(e) => setProductType(e.target.value)} placeholder="Tiaras" />
              </div>
              <div>
                <label className="label">Marca</label>
                <input className="input" value={vendor} onChange={(e) => setVendor(e.target.value)} />
              </div>
              <div>
                <label className="label">Tags</label>
                <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="novidade, kit" />
              </div>
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Fotos</h2>
              <label className="btn-ghost cursor-pointer py-1.5">
                {uploading ? 'Enviando…' : 'Adicionar fotos'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    onUpload(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            {images.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">Nenhuma foto. A primeira foto é a capa do produto.</p>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {images.map((img, i) => (
                  <div key={img.id ?? img.url ?? i} className="group relative aspect-square overflow-hidden rounded-xl bg-stone-100">
                    {img.url && <img src={img.url} alt="" className="h-full w-full object-cover" />}
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-white/90 px-1.5 text-[10px] font-medium">Capa</span>
                    )}
                    <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition group-hover:opacity-100">
                      <button type="button" className="rounded bg-white/90 px-1.5 text-xs" onClick={() => moveImage(i, -1)}>
                        ←
                      </button>
                      <button
                        type="button"
                        className="rounded bg-white/90 px-1.5 text-xs text-red-600"
                        onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      >
                        Remover
                      </button>
                      <button type="button" className="rounded bg-white/90 px-1.5 text-xs" onClick={() => moveImage(i, 1)}>
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">Variações</h2>
                <p className="text-xs text-stone-500">Ex.: Tamanho (P, M, G) ou Cor (Rosa, Branco). Até 3 opções.</p>
              </div>
              {optionRows.length < 3 && (
                <button
                  type="button"
                  className="btn-ghost py-1.5"
                  onClick={() => updateOptions([...optionRows, { name: '', valuesText: '' }])}
                >
                  Adicionar opção
                </button>
              )}
            </div>

            {optionRows.map((opt, i) => (
              <div key={i} className="mt-3 grid gap-2 sm:grid-cols-[180px_1fr_auto]">
                <input
                  className="input"
                  placeholder="Nome (ex.: Tamanho)"
                  value={opt.name}
                  onChange={(e) => updateOptions(optionRows.map((o, j) => (j === i ? { ...o, name: e.target.value } : o)))}
                />
                <input
                  className="input"
                  placeholder="Valores separados por vírgula (ex.: P, M, G)"
                  value={opt.valuesText}
                  onChange={(e) =>
                    updateOptions(optionRows.map((o, j) => (j === i ? { ...o, valuesText: e.target.value } : o)))
                  }
                />
                <button
                  type="button"
                  className="btn-ghost py-1.5 text-red-600"
                  onClick={() => updateOptions(optionRows.filter((_, j) => j !== i))}
                >
                  Remover
                </button>
              </div>
            ))}

            {hasOptions && variants.length > 1 && (
              <BulkApply onApply={applyToAll} />
            )}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-stone-500">
                    {hasOptions && <th className="pb-2 font-medium">Variação</th>}
                    <th className="pb-2 font-medium">Preço</th>
                    <th className="pb-2 font-medium">Preço "de"</th>
                    <th className="pb-2 font-medium">Custo</th>
                    <th className="pb-2 font-medium">Estoque</th>
                    <th className="pb-2 font-medium">Peso (g)</th>
                    <th className="pb-2 font-medium">SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr
                      key={v.key || 'default'}
                      className={`cursor-pointer ${i === simIndex && variants.length > 1 ? 'bg-brand-soft' : ''}`}
                      onClick={() => setSimIndex(i)}
                    >
                      {hasOptions && <td className="py-1.5 pr-2 font-medium whitespace-nowrap">{v.key}</td>}
                      <td className="py-1.5 pr-2">
                        <input
                          className="input"
                          inputMode="decimal"
                          placeholder="0,00"
                          value={v.price}
                          onChange={(e) => updateVariant(i, { price: e.target.value })}
                          required
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          className="input"
                          inputMode="decimal"
                          placeholder="opcional"
                          value={v.compareAtPrice}
                          onChange={(e) => updateVariant(i, { compareAtPrice: e.target.value })}
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          className="input"
                          inputMode="decimal"
                          placeholder="0,00"
                          value={v.cost}
                          onChange={(e) => updateVariant(i, { cost: e.target.value })}
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          className="input w-20"
                          inputMode="numeric"
                          value={v.quantity}
                          onChange={(e) => updateVariant(i, { quantity: e.target.value.replace(/\D/g, '') })}
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          className="input w-20"
                          inputMode="decimal"
                          value={v.weightGrams}
                          onChange={(e) => updateVariant(i, { weightGrams: e.target.value })}
                        />
                      </td>
                      <td className="py-1.5">
                        <input className="input" value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-stone-500">
              O peso é usado no cálculo do frete por CEP. O preço "de" aparece riscado na loja.
            </p>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          {variants.length > 1 && simRow && (
            <p className="text-xs text-stone-500">
              Simulando: <span className="font-medium text-stone-800">{simRow.key}</span> (clique numa variação para trocar)
            </p>
          )}
          <FeeSimulator
            price={simPrice}
            cost={simCost}
            fees={fees}
            onUsePrice={(p) => updateVariant(simIndex, { price: p.toFixed(2).replace('.', ',') })}
          />
        </aside>
      </div>
    </form>
  )
}

function BulkApply({
  onApply,
}: {
  onApply: (field: 'price' | 'compareAtPrice' | 'cost' | 'weightGrams' | 'quantity', value: string) => void
}) {
  const [field, setField] = useState<'price' | 'compareAtPrice' | 'cost' | 'weightGrams' | 'quantity'>('price')
  const [value, setValue] = useState('')
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-stone-50 p-3 text-sm">
      <span className="text-stone-600">Aplicar em todas:</span>
      <select className="input w-auto py-1.5" value={field} onChange={(e) => setField(e.target.value as typeof field)}>
        <option value="price">Preço</option>
        <option value="compareAtPrice">Preço "de"</option>
        <option value="cost">Custo</option>
        <option value="quantity">Estoque</option>
        <option value="weightGrams">Peso (g)</option>
      </select>
      <input className="input w-28 py-1.5" value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="button" className="btn-ghost py-1.5" onClick={() => value && onApply(field, value)}>
        Aplicar
      </button>
    </div>
  )
}
