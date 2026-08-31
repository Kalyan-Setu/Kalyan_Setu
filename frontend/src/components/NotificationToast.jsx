import React from 'react';
import { useCivic } from '../context/CivicContext';

export default function NotificationToast() {
  const { notification } = useCivic();

  if (!notification) return null;

  const isSuccess = notification.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border ${
        isSuccess 
          ? 'bg-surface-container-lowest border-gov-green text-on-surface' 
          : 'bg-surface-container-lowest border-error text-on-surface'
      }`}>
        <span className={`material-symbols-outlined ${isSuccess ? 'text-gov-green' : 'text-error'} text-xl`}>
          {isSuccess ? 'check_circle' : 'error'}
        </span>
        <div>
          <p className="font-label-md text-xs font-bold">{notification.message}</p>
          <p className="text-[10px] text-on-surface-variant">System notification</p>
        </div>
      </div>
    </div>
  );
}
