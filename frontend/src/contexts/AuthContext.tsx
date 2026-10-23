import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from '../lib/api'
import { auth, facebookProvider, googleProvider } from '../lib/firebase'
import type { CustomerProfile } from '../types'

type AuthState = {
  user: User | null
  loading: boolean
  /** undefined = carregando; null = logado mas ainda sem cadastro nesta loja */
  customer: CustomerProfile | null | undefined
  signInGoogle: () => Promise<void>
  signInFacebook: () => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (name: string, email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  refreshCustomer: () => Promise<CustomerProfile | null>
}

const AuthContext = createContext<AuthState | null>(null)

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
  'auth/email-already-in-use': 'Já existe uma conta com esse e-mail. Faça login.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/popup-closed-by-user': 'Login cancelado.',
  'auth/account-exists-with-different-credential':
    'Esse e-mail já está cadastrado com outro método de login. Entre pelo método que você usou antes.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
}

export function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code
  if (code && FIREBASE_ERRORS[code]) return FIREBASE_ERRORS[code]
  if (e instanceof Error) return e.message
  return 'Não foi possível entrar. Tente novamente.'
}

/** tenantId: loja da vitrine (carrega o cadastro do cliente). No painel fica vazio. */
export function AuthProvider({ children, tenantId }: { children: ReactNode; tenantId?: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<CustomerProfile | null | undefined>(undefined)

  const refreshCustomer = useCallback(async () => {
    if (!auth.currentUser || !tenantId) {
      setCustomer(null)
      return null
    }
    try {
      const profile = await api<CustomerProfile>('/api/store/customers/me', { tenantId })
      setCustomer(profile)
      return profile
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setCustomer(null)
        return null
      }
      throw e
    }
  }, [tenantId])

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoading(false)
        setCustomer(undefined)
        if (u) refreshCustomer().catch(() => setCustomer(null))
        else setCustomer(null)
      }),
    [refreshCustomer],
  )

  const value: AuthState = {
    user,
    loading,
    customer,
    refreshCustomer,
    signInGoogle: async () => {
      await signInWithPopup(auth, googleProvider)
    },
    signInFacebook: async () => {
      await signInWithPopup(auth, facebookProvider)
    },
    signInEmail: async (email, password) => {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    },
    signUpEmail: async (name, email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
    },
    resetPassword: async (email) => {
      await sendPasswordResetEmail(auth, email.trim())
    },
    signOut: async () => {
      await fbSignOut(auth)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora do AuthProvider')
  return ctx
}
