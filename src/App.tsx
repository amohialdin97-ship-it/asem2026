/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Layout } from './components/ui/Layout';
import { Home } from './components/User/Home';
import { Orders } from './components/User/Orders';
import { Settings } from './components/User/Settings';
import { Notifications } from './components/User/Notifications';
import { AdminDashboard } from './components/Admin/Dashboard';
import { Login } from './components/Auth/Login';
import { User as AppUser } from './types';

export default function App() {
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'notifications' | 'settings'>('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          setUserRole(userData.role);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userRole) {
    return <Login onLogin={(role) => setUserRole(role)} />;
  }

  const renderContent = () => {
    if (userRole === 'admin') return <AdminDashboard />;
    
    switch (activeTab) {
      case 'home': return <Home onTabChange={setActiveTab} />;
      case 'orders': return <Orders />;
      case 'notifications': return <Notifications />;
      case 'settings': return <Settings />;
      default: return <Home />;
    }
  };

  return (
    <Layout 
      title={userRole === 'admin' ? 'لوحة تحكم العاصم' : undefined}
      showFooter={userRole === 'user'}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </Layout>
  );
}
