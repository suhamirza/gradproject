import * as React from 'react';
import NotificationsPopup from '../Notifications/NotificationsPopup';
import { type Notification, mockNotifications } from '../../types/notifications';

interface NotificationsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function Notifications({ isOpen, onOpenChange, onUnreadCountChange }: NotificationsProps) {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications);

  // Calculate unread count
  React.useEffect(() => {
    const unreadCount = notifications.filter((n: Notification) => !n.read).length;
    onUnreadCountChange?.(unreadCount);
  }, [notifications, onUnreadCountChange]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev: Notification[]) =>
      prev.map((n: Notification) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    // Navigate or show detailed view
    if (notification.link) {
      window.location.href = notification.link;
    }

    onOpenChange(false);
  };

  return (
    <div ref={anchorRef}>
      <NotificationsPopup
        isOpen={isOpen}
        anchorRef={anchorRef}
        notifications={notifications}
        onClose={() => onOpenChange(false)}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
}
