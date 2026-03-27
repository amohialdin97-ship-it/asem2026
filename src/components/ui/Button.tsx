/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, className, ...props }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center";
  const variantStyles = {
    primary: `bg-[${PRIMARY_COLOR}] text-[${SECONDARY_COLOR}] hover:opacity-90`,
    secondary: `bg-gray-100 text-gray-800 hover:bg-gray-200`,
    outline: `border-2 border-[${PRIMARY_COLOR}] text-[${PRIMARY_COLOR}] hover:bg-red-50`,
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={variant === 'primary' ? { backgroundColor: PRIMARY_COLOR, color: SECONDARY_COLOR } : 
             variant === 'outline' ? { borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR } : {}}
      {...props}
    >
      {children}
    </button>
  );
};
