/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, Smartphone } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, logUserActivity } from '../../firebase';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const BuyPhoneForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!details.trim() || !auth.currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'buyPhoneOrders'), {
        userId: auth.currentUser.uid,
        userPhone: auth.currentUser.phoneNumber || '',
        phoneDetails: details,
        status: 'pending',
        createdAt: Date.now()
      });
      await logUserActivity(auth.currentUser.uid, 'إنشاء طلب شراء هاتف', `تم إنشاء طلب شراء هاتف جديد: ${details.substring(0, 50)}...`);
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'buyPhoneOrders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-50 rounded-2xl text-red-600">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">طلب شراء هاتف</h3>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          اكتب اسم الجوال وحجم الذاكرة واللون ونظافة الجهاز والسعر التقريبي للميزانية
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">تفاصيل الهاتف المطلوب</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[150px] text-sm"
              placeholder="مثال: آيفون 15 برو، 256 جيجا، لون تيتانيوم طبيعي، نظيف جداً، الميزانية 4000 ريال..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <Button fullWidth className="mt-4 py-4 text-lg" onClick={handleSubmit} disabled={loading}>
            <Send className="w-5 h-5 ml-2" />
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
