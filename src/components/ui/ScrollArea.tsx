import React, { forwardRef, useEffect, useRef } from 'react';
import { OverlayScrollbarsComponent, OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  contentClassName?: string;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className = '', contentClassName = '', ...props }, ref) => {
    const osRef = useRef<OverlayScrollbarsComponentRef>(null);

    // 1. On mount: Reset scroll position to top and schedule sequential layout updates
    useEffect(() => {
      const osInstance = osRef.current?.osInstance();
      if (osInstance) {
        // Reset scroll position to the top
        const { viewport } = osInstance.elements();
        if (viewport) {
          viewport.scrollTop = 0;
          viewport.scrollLeft = 0;
        }

        // Force an initial update of layout heights and sizes
        osInstance.update(true);

        // Schedule sequential updates over standard animation intervals (e.g. from Framer Motion layout transitions)
        const updateIntervals = [50, 100, 200, 350, 500, 750, 1000];
        const timers = updateIntervals.map(delay =>
          setTimeout(() => {
            const currentInst = osRef.current?.osInstance();
            if (currentInst) {
              currentInst.update(true);
            }
          }, delay)
        );

        return () => {
          timers.forEach(clearTimeout);
        };
      }
    }, []);

    // 2. On children or size updates: keep the OverlayScrollbars instance perfectly synced
    useEffect(() => {
      const osInstance = osRef.current?.osInstance();
      if (osInstance) {
        osInstance.update(true);
      }
    }, [children]);

    return (
      <OverlayScrollbarsComponent
        ref={osRef}
        element="div"
        options={{
          scrollbars: {
            theme: 'os-theme-glass',
            autoHide: 'leave',
            clickScroll: true,
          },
        }}
        defer
        className={className}
        {...props as any}
      >
        <div className={contentClassName}>
          {children}
        </div>
      </OverlayScrollbarsComponent>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';

