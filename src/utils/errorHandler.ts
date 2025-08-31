// Global error handler to prevent blank pages
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
  });

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
    console.error('Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Handle React errors (if using React 18+)
  if (typeof window !== 'undefined' && (window as any).React) {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Filter out React hydration warnings in development
      if (import.meta.env.DEV) {
        const message = args.join(' ');
        if (message.includes('Warning: Text content did not match') || 
            message.includes('Warning: Expected server HTML to contain')) {
          return;
        }
      }
      originalConsoleError.apply(console, args);
    };
  }
};

// Function to check if the app is responsive
export const checkAppHealth = () => {
  const now = Date.now();
  const lastActivity = localStorage.getItem('lastActivity') || '0';
  const timeSinceLastActivity = now - parseInt(lastActivity);
  
  // If no activity for more than 5 minutes, log a warning
  if (timeSinceLastActivity > 5 * 60 * 1000) {
    console.warn('No user activity detected for 5+ minutes');
  }
  
  // Update last activity
  localStorage.setItem('lastActivity', now.toString());
};

// Setup activity tracking
export const setupActivityTracking = () => {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  events.forEach(event => {
    document.addEventListener(event, () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    }, { passive: true });
  });
};

