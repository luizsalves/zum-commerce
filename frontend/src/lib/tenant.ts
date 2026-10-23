import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { TenantConfig } from '../types'

const LOCAL_HOSTS = ['localhost', '127.0.0.1']

/** Descobre qual loja abrir: pelo domínio (domains/{host}) ou, em localhost, pelo VITE_DEFAULT_TENANT. */
export async function resolveTenantId(): Promise<string> {
  const fallback = import.meta.env.VITE_DEFAULT_TENANT as string | undefined
  const params = new URLSearchParams(window.location.search)
  const forced = params.get('loja')
  const host = window.location.hostname.toLowerCase()

  if (LOCAL_HOSTS.includes(host) || host.endsWith('.web.app') || host.endsWith('.firebaseapp.com')) {
    if (forced) return forced
    if (fallback) return fallback
  }

  const snap = await getDoc(doc(db, 'domains', host))
  const tenantId = snap.exists() ? (snap.data().tenantId as string) : fallback
  if (!tenantId) throw new Error(`Nenhuma loja configurada para o domínio ${host}.`)
  return tenantId
}

export async function loadTenant(id: string): Promise<TenantConfig> {
  const snap = await getDoc(doc(db, 'tenants', id))
  if (!snap.exists()) throw new Error('Loja não encontrada.')
  const d = snap.data()
  if (d.active === false) throw new Error('Esta loja está temporariamente indisponível.')
  return {
    id: snap.id,
    name: d.name,
    shopDomain: d.shopDomain,
    storefrontToken: d.storefrontToken,
    apiVersion: d.apiVersion ?? '2026-10',
    primaryColor: d.primaryColor ?? null,
    logoUrl: d.logoUrl ?? null,
    whatsapp: d.whatsapp ?? null,
  }
}
