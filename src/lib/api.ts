const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function apiFetch<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  } as Record<string, string>;

  const cookies = typeof document !== 'undefined' ? document.cookie : '';
  const jwtMatch = cookies.match(/jwt=([^;]+)/);
  const token = jwtMatch ? jwtMatch[1] : null;
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
      throw new Error("Unauthorized");
    }

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || "Malformed response" };
    }

    if (!res.ok) {
      const errorMessage = (data as { error?: string })?.error || `API Error: ${res.status} ${res.statusText}`;
      console.error(`API Error [${res.status}] at ${endpoint}:`, errorMessage);
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (err) {
    if (err instanceof Error && err.name === "SyntaxError") {
      console.error(`JSON Parse error at ${endpoint}:`, err);
    } else {
      console.error(`Fetch failure at ${endpoint}:`, err);
    }
    throw err;
  }
}