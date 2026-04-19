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

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({})) as { error?: string };
      console.error(`API Error [${res.status}] at ${endpoint}:`, errorData.error);
      throw new Error(errorData.error || `API Error: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  } catch (err) {
    console.error(`Fetch failure at ${endpoint}:`, err);
    throw err;
  }
}
