export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'task' | 'mention' | 'system' | 'deadline';
  read: boolean;
  timestamp: Date;
  link?: string;
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Task Assigned',
    content: 'You have been assigned to "Create UI Design"',
    type: 'task',
    read: false,
    timestamp: new Date(),
    link: '/app/lists/design'
  },
  {
    id: '2',
    title: 'Deadline Reminder',
    content: 'Task "Update Documentation" is due tomorrow',
    type: 'deadline',
    read: false,
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    link: '/app/lists/docs'
  },
  {
    id: '3',
    title: 'Mentioned in a comment',
    content: '@suha mentioned you in "Project Planning"',
    type: 'mention',
    read: true,
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    link: '/app/lists/planning'
  }
];