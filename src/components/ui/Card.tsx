/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md active:scale-95' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
