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
  // Let the browser set the multipart boundary for FormData; only JSON bodies
  // get an explicit Content-Type and are stringified.
  const isFormData = body instanceof FormData
  if (body !== undefined && !isFormData) {
    finalHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  })

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok || payload === null || !isDataEnvelope<T>(payload)) {
    const { code, message } = extractError(payload, response.status)
    throw new ApiError(code, message, response.status)
  }

  return payload.data
}

type UploadOptions = {
  token?: string | null
  /** Called with upload progress as a fraction in [0, 1]. */
  onProgress?: (fraction: number) => void
}

/**
 * Upload `FormData` via XHR so real upload progress is reported (which `fetch`
 * cannot do). Keeps the `{ data }` unwrap and `ApiError` semantics identical to
 * {@link apiFetch}.
 */
export function uploadWithProgress<T>(
  path: string,
  formData: FormData,
  { token, onProgress }: UploadOptions = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}${path}`)
    xhr.responseType = 'json'
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(event.loaded / event.total)
      }
    }
    xhr.onload = () => {
      const payload: unknown = xhr.response
      if (xhr.status >= 200 && xhr.status < 300 && isDataEnvelope<T>(payload)) {
        resolve(payload.data)
        return
      }
      const { code, message } = extractError(payload, xhr.status)
      reject(new ApiError(code, message, xhr.status))
    }
    xhr.onerror = () => reject(new ApiError('network_error', 'Network request failed', 0))
    xhr.send(formData)
  })
}

type StreamOptions = {
  token?: string | null
  /** Called once per parsed SSE frame with its event name and JSON payload. */
  onEvent: (event: string, data: unknown) => void
  signal?: AbortSignal
}

/**
 * POST `body` and consume a Server-Sent Events response, invoking `onEvent` for
 * each frame. Used for streamed chat answers (docs/api.md). `EventSource` can't
 * send the Clerk `Authorization` header, so this uses `fetch` + a stream reader.
 * Throws a normalized {@link ApiError} if the response never starts (non-2xx).
 */
export async function streamSSE(
  path: string,
  body: unknown,
  { token, onEvent, signal }: StreamOptions,
): Promise<void> {
  const headers = new Headers({ 'Content-Type': 'application/json', Accept: 'text/event-stream' })
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok || response.body === null) {
    const payload: unknown = await response.json().catch(() => null)
    const { code, message } = extractError(payload, response.status)
    throw new ApiError(code, message, response.status)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      dispatchFrame(frame, onEvent)
      boundary = buffer.indexOf('\n\n')
    }
  }
}

/** Parse one SSE frame (`event:`/`data:` lines) and forward it to `onEvent`. */
function dispatchFrame(frame: string, onEvent: (event: string, data: unknown) => void): void {
  let event = 'message'
  const dataLines: string[] = []
  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim())
    }
  }
  if (dataLines.length === 0) return
  let data: unknown = null
  try {
    data = JSON.parse(dataLines.join('\n'))
  } catch {
    data = dataLines.join('\n')
  }
  onEvent(event, data)
}

/**
 * Fetch a binary resource (e.g. the raw PDF) as a `Blob`, attaching the Clerk
 * token and normalizing failures to {@link ApiError}. Kept separate from
 * {@link apiFetch}, which unwraps the JSON `{ data }` envelope.
 */
export async function fetchBlob(path: string, { token }: { token?: string | null } = {}): Promise<Blob> {
  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const response = await fetch(`${API_BASE}${path}`, { headers })
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null)
    const { code, message } = extractError(payload, response.status)
    throw new ApiError(code, message, response.status)
  }
  return response.blob()
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
