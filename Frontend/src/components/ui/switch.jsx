import React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import '../styles/switch.css';

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={`switch ${className || ''}`}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className="switch-thumb"
    />
  </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch }; 