/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Bell, 
  Image as ImageIcon, 
  Settings, 
  Layout as LayoutIcon, 
  MessageSquare, 
  Trash2, 
  Plus, 
  Clock, 
  Wrench, 
  Smartphone,
  CheckCircle,
  XCircle,
  Search,
  Lock,
  Unlock,
  Activity,
  Calendar,
  GripVertical
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  where,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { User, SliderImage, NewsItem, MaintenanceOrder, BuyPhoneOrder, ServiceIcon, UserActivity } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'content' | 'notifications' | 'settings'>('orders');
  const [appSettings, setAppSettings] = useState({
    maintenanceEnabled: true,
    buyPhoneEnabled: true,
    contactPhone: '777777777',
    whatsappNumber: '777777777'
  });
  const [users, setUsers] = useState<User[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [serviceIcons, setServiceIcons] = useState<ServiceIcon[]>([]);
  const [maintenanceOrders, setMaintenanceOrders] = useState<MaintenanceOrder[]>([]);
  const [buyPhoneOrders, setBuyPhoneOrders] = useState<BuyPhoneOrder[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [newNews, setNewNews] = useState('');
  const [newSliderUrl, setNewSliderUrl] = useState('');
  const [newSliderTitle, setNewSliderTitle] = useState('');
  const [newIconName, setNewIconName] = useState('');
  const [newIconType, setNewIconType] = useState<'maintenance' | 'buyPhone' | 'accounting' | 'aiChat' | 'custom'>('custom');
  const [newIconOrder, setNewIconOrder] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notificationText, setNotificationText] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [notifType, setNotifType] = useState<'all' | 'specific'>('all');

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'news' | 'slider' | 'icon' | null; id: string | null }>({
    isOpen: false,
    type: null,
    id: null
  });

  const [draggedIconId, setDraggedIconId] = useState<string | null>(null);

  const handleIconDragStart = (e: React.DragEvent, id: string) => {
    setDraggedIconId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleIconDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleIconDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedIconId || draggedIconId === targetId) return;

    const draggedIndex = serviceIcons.findIndex(icon => icon.id === draggedIconId);
    const targetIndex = serviceIcons.findIndex(icon => icon.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newIcons = [...serviceIcons];
    const [draggedItem] = newIcons.splice(draggedIndex, 1);
    newIcons.splice(targetIndex, 0, draggedItem);

    try {
      const updates = newIcons.map((icon, index) => {
        if (icon.order !== index) {
          return updateDoc(doc(db, 'serviceIcons', icon.id!), { order: index });
        }
        return Promise.resolve();
      });
      await Promise.all(updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'serviceIcons');
    }
    setDraggedIconId(null);
  };

  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [selectedUserIdForActivity, setSelectedUserIdForActivity] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedUserIdForActivity) {
      setUserActivities([]);
      return;
    }
    const q = query(
      collection(db, 'userActivities'),
      where('userId', '==', selectedUserIdForActivity),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUserActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserActivity)));
    });
    return () => unsubscribe();
  }, [selectedUserIdForActivity]);

  useEffect(() => {
    // Fetch Users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User)));
    });

    // Fetch Slider Images
    const unsubscribeSlider = onSnapshot(query(collection(db, 'sliderImages'), orderBy('order', 'asc')), (snapshot) => {
      setSliderImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SliderImage)));
    });

    // Fetch News Items
    const unsubscribeNews = onSnapshot(query(collection(db, 'newsItems'), orderBy('createdAt', 'desc')), (snapshot) => {
      setNewsItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem)));
    });

    // Fetch Service Icons
    const unsubscribeIcons = onSnapshot(query(collection(db, 'serviceIcons'), orderBy('order', 'asc')), (snapshot) => {
      setServiceIcons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceIcon)));
    });

    // Fetch Maintenance Orders
    const unsubscribeMaintenance = onSnapshot(query(collection(db, 'maintenanceOrders'), orderBy('createdAt', 'desc')), (snapshot) => {
      setMaintenanceOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceOrder)));
    });

    // Fetch Buy Phone Orders
    const unsubscribeBuy = onSnapshot(query(collection(db, 'buyPhoneOrders'), orderBy('createdAt', 'desc')), (snapshot) => {
      setBuyPhoneOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuyPhoneOrder)));
    });

    // Fetch Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'app'), (snapshot) => {
      if (snapshot.exists()) {
        setAppSettings(snapshot.data() as any);
      }
    });

    // Fetch Notifications
    const unsubscribeNotifs = onSnapshot(query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20)), (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeUsers();
      unsubscribeSlider();
      unsubscribeNews();
      unsubscribeIcons();
      unsubscribeMaintenance();
      unsubscribeBuy();
      unsubscribeSettings();
      unsubscribeNotifs();
    };
  }, []);

  const toggleBlockUser = async (user: User) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isBlocked: !user.isBlocked
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    }
  };

  const toggleUserPermission = async (user: User, permissionKey: keyof User['permissions']) => {
    try {
      const currentPermissions = user.permissions || {
        maintenance: true,
        buyPhone: true,
        accounting: true,
        aiChat: true
      };
      const newValue = !currentPermissions[permissionKey];
      await updateDoc(doc(db, 'users', user.uid), {
        [`permissions.${permissionKey}`]: newValue
      });
      await addDoc(collection(db, 'userActivities'), {
        userId: user.uid,
        action: 'تغيير صلاحية',
        details: `تم ${newValue ? 'منح' : 'سحب'} صلاحية ${permissionKey}`,
        createdAt: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    }
  };

  const addNews = async () => {
    if (!newNews.trim()) return;
    try {
      await addDoc(collection(db, 'newsItems'), {
        text: newNews,
        createdAt: Date.now()
      });
      setNewNews('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'newsItems');
    }
  };

  const confirmDelete = (type: 'news' | 'slider' | 'icon', id: string) => {
    setDeleteModal({ isOpen: true, type, id });
  };

  const executeDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;

    try {
      if (deleteModal.type === 'news') {
        await deleteDoc(doc(db, 'newsItems', deleteModal.id));
      } else if (deleteModal.type === 'slider') {
        await deleteDoc(doc(db, 'sliderImages', deleteModal.id));
      } else if (deleteModal.type === 'icon') {
        await deleteDoc(doc(db, 'serviceIcons', deleteModal.id));
      }
      setDeleteModal({ isOpen: false, type: null, id: null });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, deleteModal.type === 'news' ? 'newsItems' : deleteModal.type === 'slider' ? 'sliderImages' : 'serviceIcons');
    }
  };

  const addSliderImage = async () => {
    if (!newSliderUrl.trim() || !newSliderTitle.trim()) return;
    try {
      await addDoc(collection(db, 'sliderImages'), {
        url: newSliderUrl,
        title: newSliderTitle,
        order: sliderImages.length,
        createdAt: Date.now()
      });
      setNewSliderUrl('');
      setNewSliderTitle('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'sliderImages');
    }
  };

  const addServiceIcon = async () => {
    if (!newIconName.trim() || !newIconOrder.trim()) return;
    try {
      await addDoc(collection(db, 'serviceIcons'), {
        name: newIconName,
        iconType: newIconType,
        order: parseInt(newIconOrder, 10),
        description: '',
        createdAt: Date.now()
      });
      setNewIconName('');
      setNewIconType('custom');
      setNewIconOrder('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'serviceIcons');
    }
  };

  const updateOrderStatus = async (collectionName: string, id: string, status: string) => {
    try {
      await updateDoc(doc(db, collectionName, id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, collectionName);
    }
  };

  const sendNotification = async (type: 'all' | 'specific') => {
    if (!notificationText.trim()) return;
    if (type === 'specific' && !targetPhone.trim()) {
      alert('يرجى إدخال رقم هاتف المستخدم');
      return;
    }
    try {
      await addDoc(collection(db, 'notifications'), {
        text: notificationText,
        type,
        targetPhone: type === 'specific' ? targetPhone : null,
        createdAt: Date.now(),
        isRead: false
      });
      setNotificationText('');
      setTargetPhone('');
      alert('تم إرسال الإشعار بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'notifications');
    }
  };

  const updateAppSettings = async (newSettings: any) => {
    try {
      await updateDoc(doc(db, 'settings', 'app'), newSettings);
      alert('تم تحديث الإعدادات بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings');
    }
  };

  const filteredUsers = users.filter(u => u.phoneNumber?.includes(searchPhone));

  const filterByDate = (order: { createdAt: number }) => {
    if (!startDate && !endDate) return true;
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);

    let isAfterStart = true;
    let isBeforeEnd = true;

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      isAfterStart = orderDate >= start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      isBeforeEnd = orderDate <= end;
    }

    return isAfterStart && isBeforeEnd;
  };

  const filteredMaintenanceOrders = maintenanceOrders.filter(filterByDate);
  const filteredBuyPhoneOrders = buyPhoneOrders.filter(filterByDate);

  const maintenancePending = filteredMaintenanceOrders.filter(o => o.status === 'pending');
  const maintenanceProcessing = filteredMaintenanceOrders.filter(o => o.status === 'processing');
  const maintenanceCompleted = filteredMaintenanceOrders.filter(o => o.status === 'completed');

  const buyPending = filteredBuyPhoneOrders.filter(o => o.status === 'pending');
  const buyProcessing = filteredBuyPhoneOrders.filter(o => o.status === 'processing');
  const buyCompleted = filteredBuyPhoneOrders.filter(o => o.status === 'completed');

  const renderMaintenanceCard = (order: MaintenanceOrder) => (
    <Card key={order.id} className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <Badge variant={order.status === 'pending' ? 'warning' : order.status === 'completed' ? 'success' : 'info'}>
            {order.status === 'pending' ? 'قيد الانتظار' : order.status === 'completed' ? 'مكتمل' : 'جاري العمل'}
          </Badge>
          <h4 className="text-sm font-bold mt-2">{order.userPhone}</h4>
        </div>
        <span className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString('ar-YE')}</span>
      </div>
      <p className="text-xs text-gray-600 mb-3">{order.problem}</p>
      {order.imageUrl && (
        <img src={order.imageUrl} alt="Order" className="w-full h-32 object-cover rounded-lg mb-3" />
      )}
      <div className="flex gap-2">
        {order.status === 'pending' && (
          <Button variant="outline" className="flex-1 text-[10px]" onClick={() => updateOrderStatus('maintenanceOrders', order.id!, 'processing')}>جاري العمل</Button>
        )}
        {order.status !== 'completed' && (
          <Button variant="primary" className="flex-1 text-[10px] bg-green-600" onClick={() => updateOrderStatus('maintenanceOrders', order.id!, 'completed')}>تم الإنجاز</Button>
        )}
      </div>
    </Card>
  );

  const renderBuyPhoneCard = (order: BuyPhoneOrder) => (
    <Card key={order.id} className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <Badge variant={order.status === 'pending' ? 'warning' : order.status === 'completed' ? 'success' : 'info'}>
            {order.status === 'pending' ? 'قيد الانتظار' : order.status === 'completed' ? 'مكتمل' : 'جاري التوفير'}
          </Badge>
          <h4 className="text-sm font-bold mt-2">{order.userPhone}</h4>
        </div>
        <span className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString('ar-YE')}</span>
      </div>
      <p className="text-xs text-gray-600 mb-3">{(order as any).details || order.phoneDetails}</p>
      <div className="flex gap-2">
        {order.status === 'pending' && (
          <Button variant="outline" className="flex-1 text-[10px]" onClick={() => updateOrderStatus('buyPhoneOrders', order.id!, 'processing')}>جاري التوفير</Button>
        )}
        {order.status !== 'completed' && (
          <Button variant="primary" className="flex-1 text-[10px] bg-green-600" onClick={() => updateOrderStatus('buyPhoneOrders', order.id!, 'completed')}>تم التوفير</Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6 p-4" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">لوحة التحكم</h2>
        <Badge variant="error">مدير النظام</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-red-50 border-red-100 p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold">المستخدمين</span>
          </div>
          <span className="text-xl font-bold text-red-700">{users.length}</span>
        </Card>
        <Card className="bg-blue-50 border-blue-100 p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold">الطلبات النشطة</span>
          </div>
          <span className="text-xl font-bold text-blue-700">
            {filteredMaintenanceOrders.filter(o => o.status !== 'completed').length + filteredBuyPhoneOrders.filter(o => o.status !== 'completed').length}
          </span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'orders', name: 'الطلبات', icon: <Clock className="w-4 h-4" /> },
          { id: 'users', name: 'المستخدمين', icon: <Users className="w-4 h-4" /> },
          { id: 'content', name: 'المحتوى', icon: <LayoutIcon className="w-4 h-4" /> },
          { id: 'notifications', name: 'الإشعارات', icon: <Bell className="w-4 h-4" /> },
          { id: 'settings', name: 'الإعدادات', icon: <Settings className="w-4 h-4" /> },
        ].map((tab) => (
          <Button 
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'secondary'} 
            onClick={() => setActiveTab(tab.id as any)}
            className="whitespace-nowrap"
          >
            {tab.icon}
            <span className="mr-2">{tab.name}</span>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex flex-col gap-4">
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-6">
            {/* Date Filters */}
            <Card className="p-4">
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                تصفية حسب التاريخ
              </h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">من تاريخ</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">إلى تاريخ</label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            </Card>

            {/* Pending Orders */}
            <section>
              <h3 className="text-sm font-bold text-yellow-600 mb-3 flex items-center justify-between bg-yellow-50 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  طلبات قيد الانتظار
                </div>
                <Badge variant="warning">
                  {maintenancePending.length + buyPending.length}
                </Badge>
              </h3>
              
              {maintenancePending.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                    <Wrench className="w-3 h-3" />
                    طلبات الصيانة ({maintenancePending.length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {maintenancePending.map(order => renderMaintenanceCard(order))}
                  </div>
                </div>
              )}

              {buyPending.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                    <Smartphone className="w-3 h-3" />
                    طلبات شراء الهواتف ({buyPending.length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {buyPending.map(order => renderBuyPhoneCard(order))}
                  </div>
                </div>
              )}

              {maintenancePending.length === 0 && buyPending.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">لا توجد طلبات قيد الانتظار</p>
              )}
            </section>

            {/* Processing Orders */}
            <section>
              <h3 className="text-sm font-bold text-blue-600 mb-3 flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  طلبات جاري العمل عليها
                </div>
                <Badge variant="info">
                  {maintenanceProcessing.length + buyProcessing.length}
                </Badge>
              </h3>

              {maintenanceProcessing.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                    <Wrench className="w-3 h-3" />
                    طلبات الصيانة ({maintenanceProcessing.length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {maintenanceProcessing.map(order => renderMaintenanceCard(order))}
                  </div>
                </div>
              )}

              {buyProcessing.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                    <Smartphone className="w-3 h-3" />
                    طلبات شراء الهواتف ({buyProcessing.length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {buyProcessing.map(order => renderBuyPhoneCard(order))}
                  </div>
                </div>
              )}

              {maintenanceProcessing.length === 0 && buyProcessing.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">لا توجد طلبات جاري العمل عليها</p>
              )}
            </section>

            {/* Completed Orders */}
            <section>
              <h3 className="text-sm font-bold text-green-600 mb-3 flex items-center justify-between bg-green-50 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  طلبات مكتملة
                </div>
                <Badge variant="success">
                  {maintenanceCompleted.length + buyCompleted.length}
                </Badge>
              </h3>

              {maintenanceCompleted.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                    <Wrench className="w-3 h-3" />
                    طلبات الصيانة ({maintenanceCompleted.length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {maintenanceCompleted.map(order => renderMaintenanceCard(order))}
                  </div>
                </div>
              )}

              {buyCompleted.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                    <Smartphone className="w-3 h-3" />
                    طلبات شراء الهواتف ({buyCompleted.length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {buyCompleted.map(order => renderBuyPhoneCard(order))}
                  </div>
                </div>
              )}

              {maintenanceCompleted.length === 0 && buyCompleted.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">لا توجد طلبات مكتملة</p>
              )}
            </section>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 mb-2">
              <Input 
                placeholder="بحث برقم الهاتف..." 
                className="flex-grow" 
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
            </div>
            {filteredUsers.map((user) => (
              <Card key={user.uid} className="p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold">{user.firstName} {user.lastName}</h4>
                    <p className="text-xs text-gray-500">{user.phoneNumber}</p>
                    <Badge variant={user.isBlocked ? 'error' : 'success'}>
                      {user.isBlocked ? 'محظور' : 'نشط'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="p-2"
                      onClick={() => setSelectedUserIdForActivity(user.uid)}
                      title="سجل النشاط"
                    >
                      <Activity className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant={user.isBlocked ? 'primary' : 'outline'} 
                      className="p-2"
                      onClick={() => toggleBlockUser(user)}
                    >
                      {user.isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Permissions Section */}
                <div className="border-t pt-3 mt-1">
                  <h5 className="text-xs font-bold text-gray-600 mb-2">صلاحيات المستخدم:</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100">
                      <span>طلب صيانة</span>
                      <input
                        type="checkbox"
                        checked={user.permissions?.maintenance ?? true}
                        onChange={() => toggleUserPermission(user, 'maintenance')}
                        className="accent-red-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100">
                      <span>شراء هاتف</span>
                      <input
                        type="checkbox"
                        checked={user.permissions?.buyPhone ?? true}
                        onChange={() => toggleUserPermission(user, 'buyPhone')}
                        className="accent-red-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100">
                      <span>دفتر الحسابات</span>
                      <input
                        type="checkbox"
                        checked={user.permissions?.accounting ?? true}
                        onChange={() => toggleUserPermission(user, 'accounting')}
                        className="accent-red-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100">
                      <span>العاصم AI</span>
                      <input
                        type="checkbox"
                        checked={user.permissions?.aiChat ?? true}
                        onChange={() => toggleUserPermission(user, 'aiChat')}
                        className="accent-red-600"
                      />
                    </label>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="flex flex-col gap-6">
            <Card className="p-4">
              <h4 className="text-sm font-bold mb-4">الصور المتحركة (Slider)</h4>
              <div className="flex flex-col gap-3 mb-4">
                <Input placeholder="عنوان الصورة" value={newSliderTitle} onChange={(e) => setNewSliderTitle(e.target.value)} />
                <Input placeholder="رابط الصورة" value={newSliderUrl} onChange={(e) => setNewSliderUrl(e.target.value)} />
                <Button onClick={addSliderImage} fullWidth>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة صورة
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {sliderImages.map(img => (
                  <div key={img.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs truncate max-w-[200px]">{img.title}</span>
                    <button onClick={() => confirmDelete('slider', img.id!)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm font-bold mb-4">الشريط الإخباري</h4>
              <div className="flex flex-col gap-2 mb-4">
                <Input placeholder="أدخل الخبر هنا..." value={newNews} onChange={(e) => setNewNews(e.target.value)} />
                <Button onClick={addNews} fullWidth>إضافة خبر</Button>
              </div>
              <div className="flex flex-col gap-2">
                {newsItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs truncate max-w-[200px]">{item.text}</span>
                    <button onClick={() => confirmDelete('news', item.id!)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm font-bold mb-4">أيقونات الخدمات</h4>
              <div className="flex flex-col gap-3 mb-4">
                <Input placeholder="اسم الأيقونة" value={newIconName} onChange={(e) => setNewIconName(e.target.value)} />
                <select 
                  value={newIconType} 
                  onChange={(e) => setNewIconType(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
                >
                  <option value="maintenance">صيانة</option>
                  <option value="buyPhone">شراء هاتف</option>
                  <option value="accounting">محاسبة</option>
                  <option value="aiChat">العاصم AI</option>
                  <option value="custom">مخصص</option>
                </select>
                <Input type="number" placeholder="الترتيب (رقم)" value={newIconOrder} onChange={(e) => setNewIconOrder(e.target.value)} />
                <Button onClick={addServiceIcon} fullWidth>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة أيقونة
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {serviceIcons.map(icon => (
                  <div 
                    key={icon.id} 
                    className={`flex items-center justify-between p-2 bg-gray-50 rounded-lg transition-all ${draggedIconId === icon.id ? 'opacity-50' : ''}`}
                    draggable
                    onDragStart={(e) => handleIconDragStart(e, icon.id!)}
                    onDragOver={handleIconDragOver}
                    onDrop={(e) => handleIconDrop(e, icon.id!)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{icon.name}</span>
                        <span className="text-[10px] text-gray-500">النوع: {icon.iconType} | الترتيب: {icon.order}</span>
                      </div>
                    </div>
                    <button onClick={() => confirmDelete('icon', icon.id!)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="flex flex-col gap-6">
            <Card className="p-4 flex flex-col gap-4">
              <h4 className="text-sm font-bold">إرسال إشعار جديد</h4>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold">نوع الإشعار</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setNotifType('all')}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all ${notifType === 'all' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                    >
                      للجميع
                    </button>
                    <button 
                      onClick={() => setNotifType('specific')}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all ${notifType === 'specific' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                    >
                      لمستخدم محدد
                    </button>
                  </div>
                </div>

                {notifType === 'specific' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold">رقم هاتف المستخدم</label>
                    <Input 
                      placeholder="777777777"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold">نص الإشعار</label>
                  <textarea 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm min-h-[100px]"
                    placeholder="اكتب نص الإشعار هنا..."
                    value={notificationText}
                    onChange={(e) => setNotificationText(e.target.value)}
                  />
                </div>

                <Button fullWidth onClick={() => sendNotification(notifType)}>
                  إرسال الإشعار
                </Button>
              </div>
            </Card>

            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold">الإشعارات المرسلة مؤخراً</h4>
              {notifications.map((notif) => (
                <Card key={notif.id} className="p-3 bg-gray-50 border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant={notif.type === 'all' ? 'info' : 'warning'}>
                      {notif.type === 'all' ? 'للجميع' : `للمستخدم: ${notif.targetPhone}`}
                    </Badge>
                    <span className="text-[10px] text-gray-400">{new Date(notif.createdAt).toLocaleString('ar-YE')}</span>
                  </div>
                  <p className="text-xs text-gray-700">{notif.text}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <Card className="p-4 flex flex-col gap-6">
            <h4 className="text-sm font-bold">إعدادات التطبيق العامة</h4>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <h5 className="text-sm font-bold">تفعيل طلبات الصيانة</h5>
                  <p className="text-[10px] text-gray-500">تمكين المستخدمين من إرسال طلبات صيانة</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={appSettings.maintenanceEnabled}
                  onChange={(e) => updateAppSettings({ maintenanceEnabled: e.target.checked })}
                  className="w-5 h-5 accent-red-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <h5 className="text-sm font-bold">تفعيل طلبات الشراء</h5>
                  <p className="text-[10px] text-gray-500">تمكين المستخدمين من إرسال طلبات شراء هواتف</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={appSettings.buyPhoneEnabled}
                  onChange={(e) => updateAppSettings({ buyPhoneEnabled: e.target.checked })}
                  className="w-5 h-5 accent-red-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Input 
                  label="رقم التواصل (اتصال)" 
                  value={appSettings.contactPhone}
                  onChange={(e) => setAppSettings({ ...appSettings, contactPhone: e.target.value })}
                />
                <Input 
                  label="رقم الواتساب" 
                  value={appSettings.whatsappNumber}
                  onChange={(e) => setAppSettings({ ...appSettings, whatsappNumber: e.target.value })}
                />
                <Button fullWidth onClick={() => updateAppSettings(appSettings)}>حفظ أرقام التواصل</Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: null, id: null })}
        title="تأكيد الحذف"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            هل أنت متأكد من أنك تريد حذف {deleteModal.type === 'news' ? 'هذا الخبر' : deleteModal.type === 'slider' ? 'هذه الصورة' : 'هذه الأيقونة'}؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setDeleteModal({ isOpen: false, type: null, id: null })}
            >
              إلغاء
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={executeDelete}
            >
              نعم، احذف
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedUserIdForActivity}
        onClose={() => setSelectedUserIdForActivity(null)}
        title="سجل نشاط المستخدم"
      >
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {userActivities.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">لا يوجد نشاط مسجل لهذا المستخدم</p>
          ) : (
            userActivities.map(activity => (
              <div key={activity.id} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm text-red-600">{activity.action}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(activity.createdAt).toLocaleString('ar-SA')}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{activity.details}</p>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
