import { useState, useCallback } from 'react';
import { z, ZodSchema } from 'zod';
import { sanitizeFormData } from './sanitize';

interface UseFormValidationProps<T> {
  schema: ZodSchema<T>;
  initialData: T;
}

interface UseFormValidationReturn<T> {
  formData: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isSubmitting: boolean;
  updateField: (field: keyof T, value: unknown) => void;
  validateForm: () => boolean;
  handleSubmit: (submitFn: (data: T) => Promise<void>) => Promise<void>;
  resetForm: () => void;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
}

export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  initialData,
}: UseFormValidationProps<T>): UseFormValidationReturn<T> {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof T, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const sanitized = sanitizeFormData(formData);
    const result = schema.safeParse(sanitized);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof T, string>> = {};
      const errors = (result.error as unknown as { errors: Array<{ path: (string | number)[]; message: string }> }).errors;
      errors.forEach((err) => {
        const field = err.path[0] as keyof T;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [schema, formData]);

  const handleSubmit = useCallback(
    async (submitFn: (data: T) => Promise<void>) => {
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const sanitized = sanitizeFormData(formData);
        await submitFn(sanitized);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, formData]
  );

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  const isValid = Object.keys(errors).length === 0 && validateForm();

  return {
    formData,
    errors,
    isValid,
    isSubmitting,
    updateField,
    validateForm,
    handleSubmit,
    resetForm,
    setFormData,
  };
}
