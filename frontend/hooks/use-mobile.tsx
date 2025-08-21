"use client"

import { useState, useEffect } from 'react';

interface UseMobileOptions {
  breakpoint?: number;
}

export function useMobile(options: UseMobileOptions = {}): boolean {
  const { breakpoint = 768 } = options;
  
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

