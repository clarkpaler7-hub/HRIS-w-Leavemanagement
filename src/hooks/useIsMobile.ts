import { useEffect, useState } from 'react';

// Matches Tailwind's `md` breakpoint — anything narrower counts as "mobile".
const MOBILE_BREAKPOINT = 768;

// A phone's *shorter* dimension stays small whether it's held upright or
// sideways (rotating just swaps which axis is which) — so checking the
// smaller of width/height catches landscape phones/tablets too, unlike
// checking width alone, which a landscape phone can easily exceed.
function computeIsMobile(breakpoint: number): boolean {
  if (typeof window === 'undefined') return false;
  return Math.min(window.innerWidth, window.innerHeight) < breakpoint;
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