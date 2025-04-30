import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import '../../styles/button.css';

const getButtonClasses = (variant = 'default', size = 'default', className = '') => {
  const baseClasses = 'button';
  const variantClasses = {
    default: 'button--default',
    destructive: 'button--destructive',
    outline: 'button--outline',
    secondary: 'button--secondary',
    ghost: 'button--ghost',
    link: 'button--link'
  };
  const sizeClasses = {
    default: 'button--default',
    sm: 'button--sm',
    lg: 'button--lg',
    icon: 'button--icon'
  };

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();
};

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={getButtonClasses(variant, size, className)}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button }; 