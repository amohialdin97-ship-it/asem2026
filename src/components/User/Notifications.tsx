/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, Info } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, or, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface Notification {
  id: string;
  text: string;
  type: 'all' | 'specific';
  targetPhone: string | null;
  createdAt: number;
  isRead: boolean;
}

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'notifications');
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    let unsubscribe: () => void;

    const setupNotifications = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
        const userPhone = userDoc.exists() ? userDoc.data().phoneNumber : auth.currentUser!.phoneNumber;

        const q = query(
          collection(db, 'notifications'),
          or(
            where('type', '==', 'all'),
            where('targetPhone', '==', userPhone)
          ),
          orderBy('createdAt', 'desc')
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
          setLoading(false);
        }, (err) => handleFirestoreError(err, OperationType.GET, 'notifications'));
      } catch (error) {
        console.error("Error setting up notifications:", error);
        setLoading(false);
      }
    };

    setupNotifications();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">جاري تحميل الإشعارات...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-bold">الإشعارات</h2>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <div className="p-6 bg-gray-50 rounded-full">
            <Bell className="w-12 h-12 opacity-20" />
          </div>
          <p className="text-sm">لا توجد إشعارات جديدة</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map((notif) => (
            <Card 
              key={notif.id} 
              className={`p-4 border-r-4 transition-all cursor-pointer ${notif.isRead ? 'border-gray-200' : 'border-red-500 bg-red-50/30'}`}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${notif.type === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                  {notif.type === 'all' ? <Info className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-400">
                      {new Date(notif.createdAt).toLocaleString('ar-YE')}
                    </span>
                    {!notif.isRead && <Badge variant="error" className="text-[8px] px-1.5 py-0">جديد</Badge>}
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{notif.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
