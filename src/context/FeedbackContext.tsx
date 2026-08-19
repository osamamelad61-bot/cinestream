import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import FeedbackToast from '@/components/FeedbackToast';

export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: FeedbackType;
}

interface FeedbackContextType {
  showFeedback: (message: string, type?: FeedbackType) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showFeedback = useCallback((message: string, type: FeedbackType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Use setTimeout to ensure the state update happens after the current render cycle,
    // avoiding "Cannot update a component while rendering a different component" warnings.
    setTimeout(() => {
      setToasts((prev) => [...prev, { id, message, type }]);
    }, 0);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <FeedbackContext.Provider value={{ showFeedback }}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id}>
              <FeedbackToast
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
