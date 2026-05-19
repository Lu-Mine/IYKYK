import React, { forwardRef } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  contentClassName?: string;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className = '', contentClassName = '', ...props }, ref) => {
    return (
      <OverlayScrollbarsComponent
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
