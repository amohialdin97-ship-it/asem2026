/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Mail, Lock, History, Globe, Moon, LogOut, Save } from 'lucide-react';
import { updateProfile, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../../firebase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const Settings: React.FC = () => {
  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    if (email.toLowerCase() === 'asem123') return true;
    return String(email)
      .toLowerCase()
      .match(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      );
  };

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    let trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      alert('يرجى إدخال اسم المستخدم أو البريد الإلكتروني.');
      return;
    }

    if (trimmedEmail.toLowerCase() === 'asem123') {
      trimmedEmail = 'asem123@asem.com';
    }
    
    if (!validateEmail(trimmedEmail)) {
      alert('صيغة البريد الإلكتروني غير صحيحة.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { 
        firstName: name.split(' ')[0] || '',
        lastName: name.split(' ').slice(1).join(' ') || '',
        email: trimmedEmail 
      });
      alert('تم تحديث الملف الشخصي بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-bold">الإعدادات</h2>

      {/* Profile Section */}
      <Card className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xl">
            {name.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-bold">{name || 'مستخدم'}</h3>
            <p className="text-xs text-gray-500">{auth.currentUser?.phoneNumber}</p>
          </div>
        </div>
        
        <Input 
          label="الاسم" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <Input 
          label="البريد الإلكتروني" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <Button fullWidth onClick={handleUpdateProfile} disabled={loading}>
          <Save className="w-4 h-4 ml-2" />
          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </Card>

      {/* Security */}
      <Card className="p-4 flex flex-col gap-3">
        <h4 className="text-sm font-bold mb-2">الأمان</h4>
        <button className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-sm">تغيير كلمة المرور</span>
          </div>
          <span className="text-xs text-gray-400">›</span>
        </button>
        <button className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <History className="w-4 h-4 text-gray-400" />
            <span className="text-sm">عرض الطلبات السابقة</span>
          </div>
          <span className="text-xs text-gray-400">›</span>
        </button>
      </Card>

      {/* App Preferences */}
      <Card className="p-4 flex flex-col gap-3">
        <h4 className="text-sm font-bold mb-2">تفضيلات التطبيق</h4>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-sm">اللغة</span>
          </div>
          <select className="text-xs font-bold text-red-600 bg-transparent outline-none">
            <option>العربية</option>
            <option>English</option>
          </select>
        </div>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-gray-400" />
            <span className="text-sm">المظهر الليلي</span>
          </div>
          <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
          </div>
        </div>
      </Card>

      <Button 
        variant="outline" 
        fullWidth 
        className="mt-4 border-red-200 text-red-600 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 ml-2" />
        تسجيل الخروج
      </Button>
    </div>
  );
};
