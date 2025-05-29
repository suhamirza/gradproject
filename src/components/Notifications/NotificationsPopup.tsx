import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../types/notifications';
import NotificationItem from './NotificationItem';

interface NotificationsPopupProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLDivElement>;
  notifications: Notification[];
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationsPopup({
  isOpen,
  anchorRef,
  notifications,
  onClose,
  onNotificationClick,
  onMarkAllAsRead
}: NotificationsPopupProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Get anchor element position for positioning the popup
  const anchorRect = anchorRef.current?.getBoundingClientRect();
  if (!anchorRect) return null;

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAllAsRead();
  };

  const handleViewAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    navigate('/app/notifications');
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="absolute z-50 w-80 bg-white rounded-xl shadow-lg border-2 border-[#5C346E] overflow-hidden"
        style={{
          top: anchorRect.bottom + 8,
          right: window.innerWidth - anchorRect.right,
        }}
      >
        {/* Notification Header */}
        <div className="px-4 py-3 bg-[#5C346E] text-white flex justify-between items-center">
          <h3 className="font-bold">Notifications</h3>
          <button 
            className="text-sm hover:underline"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onNotificationClick}
              />
            ))
          )}
        </div>

        {/* View All Footer */}
        <div className="p-3 bg-gray-50 text-center">
          <button 
            className="text-[#5C346E] hover:underline font-semibold"
            onClick={handleViewAll}
          >
            View All Notifications
          </button>
        </div>
      </div>
    </>
  );
}