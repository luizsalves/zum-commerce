import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { DEFAULT_FEES, type FeeSettings } from './fees'

// Leitura e gravação das taxas da loja (tenants/{id}/private/fees). O cálculo fica em fees.ts.

export async function loadFees(tenantId: string): Promise<FeeSettings & { configured: boolean }> {
  const snap = await getDoc(doc(db, 'tenants', tenantId, 'private', 'fees'))
  if (!snap.exists()) return { ...DEFAULT_FEES, configured: false }
  return { ...DEFAULT_FEES, ...(snap.data() as Partial<FeeSettings>), configured: true }
}

export async function saveFees(tenantId: string, fees: FeeSettings) {
  const { gateway, shopifyPlan, shopifyPct, creditPct, credit12Pct, pixPct, boletoFixed } = fees
  await setDoc(doc(db, 'tenants', tenantId, 'private', 'fees'), {
    gateway,
    shopifyPlan,
    shopifyPct,
    creditPct,
    credit12Pct,
    pixPct,
    boletoFixed,
  })
}
