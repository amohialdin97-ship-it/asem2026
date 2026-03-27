/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: 'admin' | 'user';
  isBlocked: boolean;
  permissions: {
    maintenance: boolean;
    buyPhone: boolean;
    accounting: boolean;
    aiChat: boolean;
  };
  createdAt: number;
}

export interface SliderImage {
  id: string;
  url: string;
  title: string;
}

export interface NewsItem {
  id: string;
  text: string;
  createdAt: number;
}

export interface ServiceIcon {
  id: string;
  name: string;
  description: string;
  iconType: 'maintenance' | 'buyPhone' | 'accounting' | 'aiChat' | 'custom';
  order: number;
}

export interface MaintenanceOrder {
  id: string;
  userId: string;
  userPhone: string;
  problem: string;
  orderType: 'maintenance' | 'programming';
  imageUrl?: string;
  status: 'pending' | 'completed';
  createdAt: number;
}

export interface BuyPhoneOrder {
  id: string;
  userId: string;
  userPhone: string;
  phoneDetails: string;
  status: 'pending' | 'completed';
  createdAt: number;
}

export interface AccountingEntry {
  id: string;
  userId: string;
  type: 'customer' | 'supplier';
  name: string;
  amount: number;
  currency: string;
  notes: string;
  createdAt: number;
}

export interface AppSettings {
  contactPhone: string;
  locationUrl: string;
  socialMedia: {
    facebook?: string;
    whatsapp?: string;
    instagram?: string;
  };
}
