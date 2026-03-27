/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Wrench, BookOpen, Bot, MapPin, Phone, Share2, AlertCircle, Bell } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit, doc, where, or, and, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Slider } from '../ui/Slider';
import { NewsBar } from '../ui/NewsBar';
import { IconGrid } from '../ui/IconGrid';
import { Modal } from '../ui/Modal';
import { MaintenanceForm } from './MaintenanceForm';
import { BuyPhoneForm } from './BuyPhoneForm';
import { AccountingBook } from './AccountingBook';
import { AIChat } from './AIChat';
import { PRIMARY_COLOR } from '../../constants';
import { SliderImage, NewsItem } from '../../types';

interface HomeProps {
  onTabChange?: (tab: 'home' | 'orders' | 'notifications' | 'settings') => void;
}

export const Home: React.FC<HomeProps> = ({ onTabChange }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [news, setNews] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [appSettings, setAppSettings] = useState({
    maintenanceEnabled: true,
    buyPhoneEnabled: true,
    contactPhone: '777777777',
    whatsappNumber: '777777777'
  });

  useEffect(() => {
    // Fetch Slider Images
    const sliderQuery = query(collection(db, 'sliderImages'), orderBy('order', 'asc'));
    const unsubscribeSlider = onSnapshot(sliderQuery, (snapshot) => {
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SliderImage));
      setSliderImages(images);
    });

    // Fetch News Items
    const newsQuery = query(collection(db, 'newsItems'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeNews = onSnapshot(newsQuery, (snapshot) => {
      const newsTexts = snapshot.docs.map(doc => (doc.data() as NewsItem).text);
      setNews(newsTexts);
    });

    // Fetch Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'app'), (snapshot) => {
      if (snapshot.exists()) {
        setAppSettings(snapshot.data() as any);
      }
    });

    // Fetch Unread Notifications
    if (auth.currentUser) {
      let unsubscribeNotifs: () => void;
      
      const setupNotifications = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
          const userPhone = userDoc.exists() ? userDoc.data().phoneNumber : auth.currentUser!.phoneNumber;
          
          const q = query(
            collection(db, 'notifications'),
            and(
              where('isRead', '==', false),
              or(
                where('type', '==', 'all'),
                where('targetPhone', '==', userPhone)
              )
            )
          );
          unsubscribeNotifs = onSnapshot(q, (snapshot) => {
            setUnreadCount(snapshot.size);
          });
        } catch (error) {
          console.error("Error setting up notifications:", error);
        }
      };

      setupNotifications();

      return () => {
        unsubscribeSlider();
        unsubscribeNews();
        unsubscribeSettings();
        if (unsubscribeNotifs) unsubscribeNotifs();
      };
    }

    return () => {
      unsubscribeSlider();
      unsubscribeNews();
      unsubscribeSettings();
    };
  }, []);

  const icons = [
    { 
      id: 'maintenance', 
      name: 'طلب صيانة', 
      icon: <Wrench className="w-6 h-6" />, 
      onClick: () => appSettings.maintenanceEnabled ? setActiveModal('maintenance') : alert('عذراً، هذه الخدمة غير متوفرة حالياً'),
      disabled: !appSettings.maintenanceEnabled
    },
    { 
      id: 'buy', 
      name: 'شراء هاتف', 
      icon: <Smartphone className="w-6 h-6" />, 
      onClick: () => appSettings.buyPhoneEnabled ? setActiveModal('buy') : alert('عذراً، هذه الخدمة غير متوفرة حالياً'),
      disabled: !appSettings.buyPhoneEnabled
    },
    { id: 'accounting', name: 'دفتر الحسابات', icon: <BookOpen className="w-6 h-6" />, onClick: () => setActiveModal('accounting') },
    { id: 'ai', name: 'العاصم AI', icon: <Bot className="w-6 h-6" />, onClick: () => setActiveModal('ai') },
  ];

  return (
    <div className="flex flex-col gap-0">
      {/* Header with Notifications */}
      <div className="p-4 flex items-center justify-between bg-white border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900">متجر العاصم فون</h1>
          <p className="text-[10px] text-gray-500">مرحباً بك في عالم الهواتف الذكية</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => onTabChange?.('notifications')}
            className="p-2 bg-gray-50 rounded-xl text-gray-600 relative hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {sliderImages.length > 0 ? (
        <Slider images={sliderImages} />
      ) : (
        <div className="w-full aspect-[16/9] bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">
          جاري تحميل الصور...
        </div>
      )}
      
      <NewsBar news={news.length > 0 ? news : ["مرحباً بكم في العاصم فون"]} />
      
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2">خدماتنا</h2>
        <IconGrid icons={icons} />
      </div>

      {/* Quick Contact Footer */}
      <div className="mt-8 p-6 bg-gray-50 border-t border-gray-200 flex flex-col gap-6">
        <div className="flex justify-around">
          <button 
            className="flex flex-col items-center gap-2 text-gray-600 hover:text-red-600"
            onClick={() => window.open(`tel:${appSettings.contactPhone}`)}
          >
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">اتصال</span>
          </button>
          <button 
            className="flex flex-col items-center gap-2 text-gray-600 hover:text-red-600"
            onClick={() => window.open('https://maps.google.com/?q=Al-Asim+Phone')}
          >
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">موقعنا</span>
          </button>
          <button 
            className="flex flex-col items-center gap-2 text-gray-600 hover:text-red-600"
            onClick={() => window.open(`https://wa.me/${appSettings.whatsappNumber}`)}
          >
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">واتساب</span>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400">جميع الحقوق محفوظة © العاصم فون 2024</p>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'maintenance'} 
        onClose={() => setActiveModal(null)} 
        title="طلب صيانة"
      >
        <MaintenanceForm onClose={() => setActiveModal(null)} />
      </Modal>

      <Modal 
        isOpen={activeModal === 'buy'} 
        onClose={() => setActiveModal(null)} 
        title="شراء هاتف"
      >
        <BuyPhoneForm onClose={() => setActiveModal(null)} />
      </Modal>

      <Modal 
        isOpen={activeModal === 'accounting'} 
        onClose={() => setActiveModal(null)} 
        title="دفتر الحسابات"
      >
        <AccountingBook />
      </Modal>

      <Modal 
        isOpen={activeModal === 'ai'} 
        onClose={() => setActiveModal(null)} 
        title="العاصم AI"
      >
        <AIChat />
      </Modal>
    </div>
  );
};
