/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Send, X } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const MaintenanceForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [problem, setProblem] = useState('');
  const [orderType, setOrderType] = useState<'maintenance' | 'programming'>('maintenance');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!problem.trim() || !auth.currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'maintenanceOrders'), {
        userId: auth.currentUser.uid,
        userPhone: auth.currentUser.phoneNumber || '',
        problem,
        orderType,
        imageUrl: image || '',
        status: 'pending',
        createdAt: Date.now()
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'maintenanceOrders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-2">طلب خدمة صيانة</h3>
        <p className="text-sm text-gray-500 mb-6">اكتب المشكلة ونوع الطلب وقم بالتقاط صورة للجهاز</p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">وصف المشكلة</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px]"
              placeholder="اكتب تفاصيل المشكلة هنا..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={orderType === 'maintenance'}
                onChange={() => setOrderType('maintenance')}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-sm">صيانة</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={orderType === 'programming'}
                onChange={() => setOrderType('programming')}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-sm">برمجة</span>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">صورة الجهاز</label>
            <div className="flex gap-4">
              <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer">
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">التقاط صورة</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
              </label>
              <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">من المعرض</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            {image && (
              <div className="mt-4 relative rounded-xl overflow-hidden aspect-video">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
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
