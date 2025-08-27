
import { useState, useEffect } from 'react';

export const useResponsiveLayout = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      console.log('useResponsiveLayout - window.innerWidth:', window.innerWidth);
      console.log('useResponsiveLayout - setting isMobile to:', mobile);
      setIsMobile(mobile);
    };

    // Check on mount
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isMobile };
};
