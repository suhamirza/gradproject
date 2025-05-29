import type { Notification } from '../../types/notifications';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  return (
    <div
      className={`p-4 border-b border-gray-100 hover:bg-[#f7f0ff] cursor-pointer transition-colors ${
        notification.read ? 'opacity-60' : ''
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start gap-3">
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-[#5C346E] mt-2" />
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-[#5C346E] mb-1">{notification.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{notification.content}</p>
          <span className="text-xs text-gray-400">
            {new Date(notification.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}