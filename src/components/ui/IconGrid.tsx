/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Card } from './Card';
import { PRIMARY_COLOR } from '../../constants';

interface IconGridProps {
  icons: {
    id: string;
    name: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }[];
}

export const IconGrid: React.FC<IconGridProps> = ({ icons }) => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {icons.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            onClick={item.disabled ? undefined : item.onClick}
            className={`flex flex-col items-center justify-center aspect-square gap-2 border-none shadow-none bg-gray-50 hover:bg-red-50 ${item.disabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
          >
            <div className="p-3 rounded-2xl bg-white shadow-sm" style={{ color: item.disabled ? '#9ca3af' : PRIMARY_COLOR }}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">
              {item.name}
            </span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
