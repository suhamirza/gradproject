const { sendWelcomeEmail } = require('../services/emailService');

const QUEUES = {
  USER_SIGNUPED: {
    name: 'user-signuped',
    handler: async (data) => {
      await sendWelcomeEmail(data);
    }
  },
  TASK_CREATED: {
    name: 'task-created',
    handler: async (data) => {
      // Handle task creation notification
      console.log('Task created:', data);
    }
  },
  TASK_UPDATED: {
    name: 'task-updated',
    handler: async (data) => {
      // Handle task update notification
      console.log('Task updated:', data);
    }
  }
};

module.exports = {
  QUEUES
}; 