const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.amroaltayeb14.workers.dev";

export async function apiFetch<T>(
  endpoint: string, 
  options: RequestInit & { orgId?: string | null } = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const { orgId, ...requestOptions } = options;
  
  const headers = {
    "Content-Type": "application/json",
    ...(requestOptions.headers || {}),
  } as Record<string, string>;

  // Only inject the header if a valid orgId is provided
  if (orgId) {
    headers["x-organization-id"] = orgId;
  }

  try {
    const res = await fetch(url, {
      ...requestOptions,
      credentials: "include",
      headers,
    });

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
      throw new Error("Unauthorized");
    }

    // Read the response as text first to handle empty bodies
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
