/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Download, Share2, Wallet, Users, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AccountingEntry } from '../../types';

export const AccountingBook: React.FC = () => {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'customer' | 'supplier'>('customer');
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'accountingEntries'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccountingEntry));
      setEntries(data);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'accountingEntries');
    });

    return () => unsubscribe();
  }, []);

  const handleAddEntry = async () => {
    if (!name || !amount || !auth.currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'accountingEntries'), {
        userId: auth.currentUser.uid,
        name,
        amount: parseFloat(amount) * (type === 'customer' ? 1 : -1),
        type,
        currency: 'ريال',
        createdAt: Date.now()
      });
      setName('');
      setAmount('');
      setShowAdd(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'accountingEntries');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'accountingEntries', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'accountingEntries');
    }
  };

  const totalCustomers = entries.filter(e => e.type === 'customer').reduce((acc, curr) => acc + curr.amount, 0);
  const totalSuppliers = entries.filter(e => e.type === 'supplier').reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-green-50 border-green-100 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-xs font-bold">إجمالي العملاء</span>
          </div>
          <span className="text-xl font-bold text-green-700">{totalCustomers} ريال</span>
        </Card>
        <Card className="bg-red-50 border-red-100 p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <ArrowDownLeft className="w-4 h-4" />
            <span className="text-xs font-bold">إجمالي الموردين</span>
          </div>
          <span className="text-xl font-bold text-red-700">{totalSuppliers} ريال</span>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button className="flex-1 py-3" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4 ml-2" />
            {showAdd ? 'إلغاء' : 'إضافة قيد'}
          </Button>
          <Button variant="secondary" className="px-4">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="secondary" className="px-4">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {showAdd && (
          <Card className="p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <input
              type="text"
              placeholder="الاسم (عميل أو مورد)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="number"
              placeholder="المبلغ"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={type === 'customer'} onChange={() => setType('customer')} />
                <span className="text-sm">عميل</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={type === 'supplier'} onChange={() => setType('supplier')} />
                <span className="text-sm">مورد</span>
              </label>
            </div>
            <Button fullWidth onClick={handleAddEntry} disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ القيد'}
            </Button>
          </Card>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-gray-500">القيود الأخيرة</h3>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">لا توجد قيود مسجلة</div>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${entry.type === 'customer' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {entry.type === 'customer' ? <Users className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{entry.name}</h4>
                  <p className="text-[10px] text-gray-400">{new Date(entry.createdAt).toLocaleDateString('ar-YE')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <span className={`text-sm font-bold ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(entry.amount)} {entry.currency}
                  </span>
                  <div className="mt-1">
                    <Badge variant={entry.type === 'customer' ? 'success' : 'error'}>
                      {entry.type === 'customer' ? 'عميل' : 'مورد'}
                    </Badge>
                  </div>
                </div>
                <button 
                  onClick={() => entry.id && handleDeleteEntry(entry.id)}
                  className="p-1 text-gray-300 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Backup Notice */}
      <Card className="bg-blue-50 border-blue-100 p-4 flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg text-blue-600">
          <Download className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-blue-800">النسخ الاحتياطي</h4>
          <p className="text-[10px] text-blue-600">يتم مزامنة بياناتك تلقائياً مع Google Drive</p>
        </div>
      </Card>
    </div>
  );
};
