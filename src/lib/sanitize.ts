export function sanitizeString(value: string): string {
  return value.trim().replace(/[<>]/g, '');
}

export function sanitizeNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

export function sanitizePhone(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  const sanitized = { ...data } as Record<string, unknown>;

  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('whatsapp')) {
        sanitized[key] = sanitizePhone(value);
      } else {
        sanitized[key] = sanitizeString(value);
      }
    } else if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('requiredamount')) {
      sanitized[key] = sanitizeNumber(value);
    }
  }

  return sanitized as T;
}
