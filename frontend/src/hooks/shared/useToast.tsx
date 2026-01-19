import { useState, useCallback } from 'react';
import { ToastType } from '../../components/shared/Toast';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    setToast({ message, type, isVisible: true });
    
    if (duration !== 0) {
      setTimeout(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
      }, duration || 3000);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  return { toast, showToast, hideToast };
}
