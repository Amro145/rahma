const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.amroaltayeb14.workers.dev";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Optional: Handle unauthorized globally (e.g., redirect to signin)
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(errorData.error || `API Error: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
