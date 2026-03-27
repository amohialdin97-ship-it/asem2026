/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { History, Smartphone, Wrench, Clock, CheckCircle } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MaintenanceOrder, BuyPhoneOrder } from '../../types';

export const Orders: React.FC = () => {
  const [maintenance, setMaintenance] = useState<MaintenanceOrder[]>([]);
  const [buyPhone, setBuyPhone] = useState<BuyPhoneOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const mQuery = query(
      collection(db, 'maintenanceOrders'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const bQuery = query(
      collection(db, 'buyPhoneOrders'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeM = onSnapshot(mQuery, (snapshot) => {
      setMaintenance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceOrder)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'maintenanceOrders'));

    const unsubscribeB = onSnapshot(bQuery, (snapshot) => {
      setBuyPhone(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuyPhoneOrder)));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'buyPhoneOrders'));

    return () => {
      unsubscribeM();
      unsubscribeB();
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">جاري تحميل الطلبات...</div>;
  }

  const allOrders = [
    ...maintenance.map(o => ({ ...o, type: 'maintenance' })),
    ...buyPhone.map(o => ({ ...o, type: 'buy' }))
  ].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-bold">طلباتي</h2>

      {allOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <History className="w-16 h-16 opacity-20" />
          <p className="text-sm">لا توجد طلبات سابقة</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {allOrders.map((order: any) => (
            <Card key={order.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${order.type === 'maintenance' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  {order.type === 'maintenance' ? <Wrench className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold">
                    {order.type === 'maintenance' ? (order.orderType === 'maintenance' ? 'صيانة' : 'برمجة') : 'شراء هاتف'}
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('ar-YE')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'info'}>
                  {order.status === 'completed' ? 'مكتمل' : order.status === 'pending' ? 'قيد الانتظار' : 'جاري العمل'}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  {order.status === 'completed' ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3 text-yellow-500" />}
                  <span>{order.status === 'completed' ? 'تم التسليم' : 'جاري العمل'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
