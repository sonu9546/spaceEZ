'use client';

import React, { forwardRef } from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';

export interface AppButtonProps
  extends Omit<ButtonProps, 'loading'> {
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  animateOnHover?: boolean;
}

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      prefixIcon,
      suffixIcon,
      isLoading = false,
      fullWidth = false,
      animateOnHover = true,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const classes = [
      'transition-all duration-300 ease-in-out',
      fullWidth && 'w-full',
      animateOnHover && !isDisabled && 'hover:shadow-md',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Button
        ref={ref}
        loading={isLoading}
        disabled={isDisabled}
        className={classes}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {prefixIcon && (
            <span className="flex items-center">{prefixIcon}</span>
          )}
          <span>{children}</span>
          {suffixIcon && (
            <span className="flex items-center">{suffixIcon}</span>
          )}
        </span>
      </Button>
    );
  }
);

AppButton.displayName = 'AppButton';

export default AppButton;
