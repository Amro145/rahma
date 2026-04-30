/**
 * apiFetch — routes all API calls through the local Next.js proxy at /api/[...path]
 * which reads the httpOnly JWT cookie server-side and forwards it as a Bearer token.
 * Never reads document.cookie directly (httpOnly cookies are invisible to JS).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const errorMessages: Record<number, string> = {
  400: 'البيانات المدخلة غير صحيحة، يرجى التحقق من الحقول',
  401: 'يرجى تسجيل الدخول للمتابعة',
  403: 'ليس لديك صلاحية للقيام بهذا الإجراء',
  404: 'الصفحة المطلوبة غير موجودة',
  500: 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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
      throw new ApiError('يرجى تسجيل الدخول للمتابعة', 401);
    }

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || 'استجابة غير صحيحة من الخادم' };
    }

    if (!res.ok) {
      const status = res.status;
      
      // Handle Zod validation errors from backend (zValidator format)
      if (status === 400 && typeof data === 'object' && data !== null && 'error' in data) {
        const errorData = data as { error?: unknown };
        
        // Check if it's a Zod error format (has _errors or nested structure)
        if (errorData.error && typeof errorData.error === 'object') {
          const zodError = errorData.error as Record<string, { _errors?: string[] }>;
          const fieldErrors = Object.entries(zodError)
            .filter(([key]) => key !== '_errors')
            .map(([field, value]) => `${field}: ${value?._errors?.join(', ') || 'خطأ'}`)
            .join(' | ');
          
          if (fieldErrors) {
            throw new ApiError(`خطأ في البيانات: ${fieldErrors}`, 400);
          }
        }
        
        const serverError = errorData.error as string;
        if (typeof serverError === 'string') {
          throw new ApiError(serverError, 400);
        }
      }
      
      const serverError = (data as { error?: string })?.error;
      const message = serverError || errorMessages[status] || `خطأ ${status}: ${res.statusText}`;
      throw new ApiError(message, status);
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'SyntaxError') {
      throw new ApiError('استجابة غير صحيحة من الخادم', 0, err);
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new ApiError('تعذر الاتصال بالخادم، يرجى التحقق من اتصالك', 0, err);
    }
    throw new ApiError('حدث خطأ غير متوقع', 0, err as Error);
  }
}