const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaskAssignee = sequelize.define('TaskAssignee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
    // No foreign key constraint since user is in different service
  },
  role: {
    type: DataTypes.ENUM('primary', 'secondary', 'reviewer'),
    allowNull: false
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  updatedAt: 'updatedAt',
  tableName: 'task_assignees'
});

module.exports = TaskAssignee; 