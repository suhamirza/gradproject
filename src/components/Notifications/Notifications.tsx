import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Notification } from '../../types/notifications';
import { mockNotifications } from '../../types/notifications';
import NotificationsIcon from './NotificationsIcon';
import NotificationsPopup from './NotificationsPopup';

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const anchorRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    // Navigate or show detailed view
    if (notification.link) {
      window.location.href = notification.link;
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  return (
    <div ref={anchorRef}>
      <NotificationsIcon 
        unreadCount={unreadCount} 
        onClick={() => setIsOpen(!isOpen)} 
      />
      <NotificationsPopup
        isOpen={isOpen}
        anchorRef={anchorRef}
        notifications={notifications}
        onClose={() => setIsOpen(false)}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}
