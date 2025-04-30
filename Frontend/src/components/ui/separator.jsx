import React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import '../styles/separator.css';

const Separator = React.forwardRef(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={`separator ${className || ''}`}
    {...props}
  />
));

Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator }; 