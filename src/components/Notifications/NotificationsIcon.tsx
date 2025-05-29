import { FaBell } from "react-icons/fa6";

interface NotificationsIconProps {
  unreadCount: number;
  onClick: () => void;
}

export default function NotificationsIcon({ unreadCount, onClick }: NotificationsIconProps) {
  return (
    <button 
      className="text-white text-2xl focus:outline-none flex items-center justify-center p-2 hover:bg-[#3b2355] rounded-full transition-colors"
      onClick={onClick}
    >
      <div className="relative">
        <FaBell size={28} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
            {unreadCount}
          </div>
        )}
      </div>
    </button>
  );
}