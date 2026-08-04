import { useEffect, useState } from 'react'

type HealthState =
  | { status: 'loading' }
  | { status: 'ok'; environment: string }
  | { status: 'error'; message: string }

function App() {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' })

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { status: string; environment: string }) =>
        setHealth({ status: 'ok', environment: data.environment }),
      )
      .catch((err: unknown) =>
        setHealth({
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        }),
      )
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <main className="max-w-xl text-center space-y-6">
        <span className="inline-block rounded-full bg-slate-800 px-3 py-1 text-xs font-medium tracking-wide text-slate-300">
          grep-pdf
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Search inside your PDFs
        </h1>
        <p className="text-slate-400 text-lg">
          A local FastAPI + React starter. Everything below is scaffolding —
          start building your search experience here.
        </p>

        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm">
          <span className="text-slate-400">API health:</span>
          {health.status === 'loading' && (
            <span className="text-amber-400">checking…</span>
          )}
          {health.status === 'ok' && (
            <span className="text-emerald-400">
              ● ok ({health.environment})
            </span>
          )}
          {health.status === 'error' && (
            <span className="text-rose-400">● unreachable ({health.message})</span>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
