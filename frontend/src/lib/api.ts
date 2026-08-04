// Typed API client (docs/api.md). All backend calls go through here so auth,
// typing, and error handling stay in one place. Requests hit relative `/api/*`
// paths, which Vite proxies to the backend in dev (vite.config.ts).

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

/** Success envelope: `{ data: T }`. */
type DataEnvelope<T> = { data: T }

/** Failure envelope: `{ error: { code, message } }`. */
type ErrorEnvelope = { error: { code: string; message: string } }

/** Thrown for any non-successful API response; carries the server's error code. */
export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  /** Clerk session token to send as `Authorization: Bearer <token>`. */
  token?: string | null
  body?: unknown
}

/**
 * Fetch a JSON endpoint, unwrapping the `{ data }` envelope on success and
 * throwing a normalized `ApiError` on failure.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, headers, ...rest } = options

  const finalHeaders = new Headers(headers)
  if (token) {
    finalHeaders.set('Authorization', `Bearer ${token}`)
  }
  if (body !== undefined) {
    finalHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok || payload === null || !isDataEnvelope<T>(payload)) {
    const { code, message } = extractError(payload, response.status)
    throw new ApiError(code, message, response.status)
  }

  return payload.data
}

function isDataEnvelope<T>(value: unknown): value is DataEnvelope<T> {
  return typeof value === 'object' && value !== null && 'data' in value
}

function extractError(
  payload: unknown,
  status: number,
): { code: string; message: string } {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof (payload as ErrorEnvelope).error === 'object'
  ) {
    const { code, message } = (payload as ErrorEnvelope).error
    return { code, message }
  }
  return { code: 'unknown_error', message: `Request failed with status ${status}` }
}
