import React from 'react';
import FadeContent from '../ReactBits/FadeContent';
import NotificationItem from '../Notifications/NotificationItem';
import { mockNotifications, Notification } from '../../types/notifications';

type FilterType = 'all' | 'unread' | 'read';
type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [filterType, setFilterType] = React.useState<FilterType>('all');
  const [dateFilter, setDateFilter] = React.useState<DateFilter>('all');
  // Filter notifications based on search, read/unread status, and date
  const filteredNotifications = React.useMemo(() => {
    return notifications
      .filter((notif: Notification) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            notif.title.toLowerCase().includes(query) ||
            notif.content.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .filter((notif: Notification) => {
        // Read/Unread filter
        if (filterType === 'read') return notif.read;
        if (filterType === 'unread') return !notif.read;
        return true;
      })
      .filter((notif: Notification) => {
        // Date filter
        const now = new Date();
        const notifDate = new Date(notif.timestamp);
        
        switch (dateFilter) {
          case 'today': {
            return notifDate.toDateString() === now.toDateString();
          }
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return notifDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return notifDate >= monthAgo;
          }
          default:
            return true;
        }
      });
  }, [notifications, searchQuery, filterType, dateFilter]);
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n: Notification) => !n.read).length;
  }, [notifications]);

  return (
    <FadeContent>
      <div className="max-w-5xl mx-auto px-8 py-6">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-[2.75rem] font-extrabold text-[#180620]">
            Notifications
          </h1>
          <div className="mt-2 text-gray-500">
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </div>
        </div>        {/* Search and Filters Section */}
        <div className="mb-8 bg-white p-6 pb-8 rounded-2xl border-2 border-[#c7b3d6] shadow-sm hover:border-[#5C346E] transition-all duration-200">
          {/* Search Bar with Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#5C346E] mb-2">Search Notifications</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>                <input
                  id="search-input"
                  type="text"
                  placeholder="Search by title or content..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200 placeholder-gray-400 hover:border-[#5C346E] bg-white"
                />
              </div>
            </div>

            {/* Status Filter Dropdown */}
            <div className="lg:min-w-[180px]">
              <label className="block text-sm font-medium text-[#5C346E] mb-2">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Status
                </div>
              </label>              <select
                value={filterType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value as FilterType)}
                className="w-full py-3 px-4 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200 hover:border-[#5C346E] bg-white text-[#5C346E] font-medium cursor-pointer"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>

            {/* Time Period Filter Dropdown */}
            <div className="lg:min-w-[160px]">
              <label className="block text-sm font-medium text-[#5C346E] mb-2">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
                  </svg>
                  Time Period
                </div>
              </label>              <select
                value={dateFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateFilter(e.target.value as DateFilter)}
                className="w-full py-3 px-4 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200 hover:border-[#5C346E] bg-white text-[#5C346E] font-medium cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#c7b3d6] transition-colors duration-200 hover:border-[#5C346E]">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-gray-500 font-medium">No notifications found</div>
              {searchQuery && (
                <div className="text-gray-400 text-sm mt-1">
                  Try adjusting your search or filters
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-[#c7b3d6] overflow-hidden divide-y-2 divide-[#c7b3d6] transition-colors duration-200 hover:border-[#5C346E]">
              {filteredNotifications.map((notification: Notification) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </FadeContent>
  );
}
