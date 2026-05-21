import { useEffect } from 'react';
import { OverlayScrollbars } from 'overlayscrollbars';
import 'overlayscrollbars/styles/overlayscrollbars.css';

export function useGlobalOverlayScrollbars() {
  useEffect(() => {
    const initScrollbars = () => {
      const elements = document.querySelectorAll(
        '.custom-scrollbar:not([data-react-scrollarea]):not([data-overlayscrollbars-initialize]):not([data-overlayscrollbars]), ' +
        '.overflow-y-auto:not([data-react-scrollarea]):not([data-overlayscrollbars-initialize]):not([data-overlayscrollbars]), ' +
        '.overflow-auto:not([data-react-scrollarea]):not([data-overlayscrollbars-initialize]):not([data-overlayscrollbars])'
      );
      elements.forEach(el => {
        // Skip body/html
        if (el === document.body || el === document.documentElement) return;
        
        // Ensure it doesn't already have it
        if (!OverlayScrollbars(el as HTMLElement)) {
           OverlayScrollbars(el as HTMLElement, {
             scrollbars: {
              theme: 'os-theme-glass',
                autoHide: 'leave',
                clickScroll: true
             }
           });
        }
      });
    };

    // Initial check
    const timeout = setTimeout(initScrollbars, 100);

    // Watch for DOM changes to automatically apply to new elements
    const observer = new MutationObserver((mutations) => {
      let needsInit = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          needsInit = true;
          break;
        }
      }
      if (needsInit) {
        initScrollbars();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);
}
