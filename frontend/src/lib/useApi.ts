// Binds the typed API client to the current Clerk session. Components call
// `const api = useApi()` and then `api.get('/api/me')` — the Clerk token is
// injected automatically, so callers never handle auth themselves.

import { useAuth } from '@clerk/react'
import { useMemo } from 'react'
import { apiFetch, uploadWithProgress } from './api'

export function useApi() {
  const { getToken } = useAuth()

  return useMemo(
    () => ({
      async get<T>(path: string): Promise<T> {
        const token = await getToken()
        return apiFetch<T>(path, { method: 'GET', token })
      },
      async post<T>(path: string, body?: unknown): Promise<T> {
        const token = await getToken()
        return apiFetch<T>(path, { method: 'POST', token, body })
      },
      async upload<T>(
        path: string,
        formData: FormData,
        onProgress?: (fraction: number) => void,
      ): Promise<T> {
        const token = await getToken()
        return uploadWithProgress<T>(path, formData, { token, onProgress })
      },
    }),
    // getToken identity is stable per Clerk session.
    [getToken],
  )
}
