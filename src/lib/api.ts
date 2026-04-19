const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
  } else if (endpoint.startsWith("/api/") && !endpoint.includes("/auth") && !endpoint.includes("/organization")) {
    // If we're calling a tenant-specific API without an orgId, we should handle it.
    // However, instead of throwing immediately here, we allow the fetch 
    // so the backend can return the 400, which the caller can then handle.
    // BUT to satisfy the "graceful" requirement, let's log a warning.
    console.warn(`[apiFetch] Calling tenant API ${endpoint} without orgId.`);
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

    if (res.status === 400 && !orgId) {
      throw new Error("يرجى اختيار مؤسسة للمتابعة");
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
      // Re-throw so the caller (e.g. SWR) knows about the error
      console.error(`Fetch failure at ${endpoint}:`, err);
    }
    throw err;
  }
}
