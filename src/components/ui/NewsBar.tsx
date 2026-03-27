/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { PRIMARY_COLOR } from '../../constants';

interface NewsBarProps {
  news: string[];
}

export const NewsBar: React.FC<NewsBarProps> = ({ news }) => {
  if (news.length === 0) return null;

  return (
    <div className="bg-red-50 border-y border-red-100 py-2 overflow-hidden whitespace-nowrap relative">
      <div className="absolute left-0 top-0 bottom-0 bg-red-600 text-white px-3 flex items-center z-10 text-xs font-bold">
        أخبار
      </div>
      <motion.div
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="inline-block pl-[100%] pr-4"
      >
        {news.map((item, index) => (
          <span key={index} className="mx-8 text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};
