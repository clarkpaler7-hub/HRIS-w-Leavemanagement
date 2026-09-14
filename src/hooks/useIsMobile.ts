import { useEffect, useState } from 'react';

// Matches Tailwind's `md` breakpoint — a narrow viewport counts as mobile.
const MOBILE_BREAKPOINT = 768;

// Responsive CSS is based on viewport width. Using the smaller screen
// dimension incorrectly classifies common laptop resolutions (for example,
// 1366×720) as mobile because their height is below the breakpoint.
function computeIsMobile(breakpoint: number): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoint;
}

export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(() => computeIsMobile(breakpoint));

  useEffect(() => {
    const handleChange = () => setIsMobile(computeIsMobile(breakpoint));

    handleChange();
    window.addEventListener('resize', handleChange);
    window.addEventListener('orientationchange', handleChange);
    return () => {
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('orientationchange', handleChange);
    };
  }, [breakpoint]);

  return isMobile;
}
