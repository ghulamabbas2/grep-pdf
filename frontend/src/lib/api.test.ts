// Unit tests for the typed API client (envelope unwrapping + error normalization).

import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiFetch } from './api'

function mockResponse(body: unknown, init: { ok?: boolean; status?: number } = {}): Response {
  const { ok = true, status = 200 } = init
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response
}

function stubFetch(response: Response): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('apiFetch', () => {
  it('unwraps the { data } envelope on success', async () => {
    stubFetch(mockResponse({ data: { id: 'user_1' } }))

    await expect(apiFetch('/api/me')).resolves.toEqual({ id: 'user_1' })
  })

  it('attaches the bearer token when provided', async () => {
    const fetchMock = stubFetch(mockResponse({ data: {} }))

    await apiFetch('/api/me', { token: 'sess_123' })

    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer sess_123')
  })

  it('omits the Authorization header when no token is given', async () => {
    const fetchMock = stubFetch(mockResponse({ data: {} }))

    await apiFetch('/api/me')

    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Headers
    expect(headers.has('Authorization')).toBe(false)
  })

  it('serializes a JSON body and sets Content-Type', async () => {
    const fetchMock = stubFetch(mockResponse({ data: {} }))

    await apiFetch('/api/thing', { method: 'POST', body: { name: 'x' } })

    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init.body).toBe(JSON.stringify({ name: 'x' }))
    expect((init.headers as Headers).get('Content-Type')).toBe('application/json')
  })

  it('throws a normalized ApiError from the { error } envelope', async () => {
    stubFetch(
      mockResponse(
        { error: { code: 'unauthorized', message: 'No token' } },
        { ok: false, status: 401 },
      ),
    )

    await expect(apiFetch('/api/me')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'unauthorized',
      message: 'No token',
      status: 401,
    })
    await expect(apiFetch('/api/me')).rejects.toBeInstanceOf(ApiError)
  })

  it('falls back to a generic error when the body is not an error envelope', async () => {
    stubFetch(mockResponse(null, { ok: false, status: 500 }))

    await expect(apiFetch('/api/me')).rejects.toMatchObject({
      code: 'unknown_error',
      status: 500,
    })
  })

  it('treats an ok response without a data envelope as an error', async () => {
    stubFetch(mockResponse({ unexpected: true }))

    await expect(apiFetch('/api/me')).rejects.toBeInstanceOf(ApiError)
  })
})
