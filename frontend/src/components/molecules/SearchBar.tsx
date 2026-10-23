import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

/** Busca de produtos: leva para /?q=termo. */
export function SearchBar({ className = '' }: { className?: string }) {
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const navigate = useNavigate()

  useEffect(() => setSearch(params.get('q') ?? ''), [params])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const term = search.trim()
    navigate(term ? `/?q=${encodeURIComponent(term)}` : '/')
  }

  return (
    <form onSubmit={onSubmit} className={className} role="search">
      <input
        className="input max-w-md rounded-full"
        placeholder="Buscar produtos"
        aria-label="Buscar produtos"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </form>
  )
}
