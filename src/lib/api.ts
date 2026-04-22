/**
 * apiFetch — routes all API calls through the local Next.js proxy at /api/[...path]
 * which reads the httpOnly JWT cookie server-side and forwards it as a Bearer token.
 * Never reads document.cookie directly (httpOnly cookies are invisible to JS).
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // endpoint is expected to be like "/api/students" — proxy strips /api and calls backend
  const url = endpoint;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  } as Record<string, string>;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
      throw new Error('Unauthorized');
    }

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || 'Malformed response' };
    }

    if (!res.ok) {
      const errorMessage =
        (data as { error?: string })?.error ||
        `API Error: ${res.status} ${res.statusText}`;
      console.error(`API Error [${res.status}] at ${endpoint}:`, errorMessage);
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'SyntaxError') {
      console.error(`JSON Parse error at ${endpoint}:`, err);
    } else {
      console.error(`Fetch failure at ${endpoint}:`, err);
    }
    throw err;
  }
}