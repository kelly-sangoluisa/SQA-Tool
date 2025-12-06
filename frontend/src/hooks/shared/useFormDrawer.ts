import { useState, useEffect } from 'react';

interface UseFormDrawerOptions<T> {
  initialData?: T | null;
  onSave: (data?: T) => void;
  onClose: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UseFormDrawerReturn<T> {
  isVisible: boolean;
  loading: boolean;
  errors: Record<string, string>;
  setLoading: (loading: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  handleClose: () => void;
  clearError: (field: string) => void;
}

export function useFormDrawer<T>({
  onClose
}: UseFormDrawerOptions<T>): UseFormDrawerReturn<T> {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return {
    isVisible,
    loading,
    errors,
    setLoading,
    setErrors,
    handleClose,
    clearError
  };
}
