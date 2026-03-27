/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home as HomeIcon, History, Settings as SettingsIcon, Bell } from 'lucide-react';
import { STORE_NAME, PRIMARY_COLOR } from '../../constants';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showFooter?: boolean;
  activeTab?: 'home' | 'orders' | 'notifications' | 'settings';
  onTabChange?: (tab: 'home' | 'orders' | 'notifications' | 'settings') => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showFooter = true, 
  activeTab = 'home', 
  onTabChange 
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>
          {title || STORE_NAME}
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto pb-20">
        {children}
      </main>

      {/* Footer (Mobile Navigation) */}
      {showFooter && onTabChange && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-red-600' : 'text-gray-400'}`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">الرئيسية</span>
          </button>
          <button 
            onClick={() => onTabChange('orders')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'orders' ? 'text-red-600' : 'text-gray-400'}`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-bold">طلباتي</span>
          </button>
          <button 
            onClick={() => onTabChange('notifications')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'notifications' ? 'text-red-600' : 'text-gray-400'}`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px] font-bold">الإشعارات</span>
          </button>
          <button 
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-red-600' : 'text-gray-400'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">الإعدادات</span>
          </button>
        </nav>
      )}
    </div>
  );
};
