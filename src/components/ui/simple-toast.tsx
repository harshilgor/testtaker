import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, Trophy, Star } from 'lucide-react';

export interface SimpleToast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

interface SimpleToastContextType {
  showToast: (toast: Omit<SimpleToast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const SimpleToastContext = createContext<SimpleToastContextType | undefined>(undefined);

export const useSimpleToast = () => {
  const context = useContext(SimpleToastContext);
  if (!context) {
    throw new Error('useSimpleToast must be used within a SimpleToastProvider');
  }
  return context;
};

export const SimpleToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<SimpleToast[]>([]);

  const showToast = useCallback((toast: Omit<SimpleToast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-hide after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const getToastIcon = (type: SimpleToast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
      case 'info':
        return <Star className="h-5 w-5 text-gray-600" />;
      case 'warning':
        return <Trophy className="h-5 w-5 text-gray-600" />;
      case 'error':
        return <X className="h-5 w-5 text-gray-600" />;
    }
  };

  const getToastStyles = (type: SimpleToast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-white border-gray-300 text-gray-900';
      case 'info':
        return 'bg-white border-gray-300 text-gray-900';
      case 'warning':
        return 'bg-white border-gray-300 text-gray-900';
      case 'error':
        return 'bg-white border-gray-300 text-gray-900';
    }
  };

  return (
    <SimpleToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-out ${getToastStyles(toast.type)}`}
          >
            <div className="flex items-start gap-3">
              {getToastIcon(toast.type)}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold">{toast.title}</h4>
                {toast.description && (
                  <p className="text-xs mt-1 opacity-90">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => hideToast(toast.id)}
                className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </SimpleToastContext.Provider>
  );
};
