const Task = require('./Task');
const TaskAssignee = require('./TaskAssignee');
const TaskComment = require('./TaskComment');
const TaskHistory = require('./TaskHistory');
const TaskAttachment = require('./TaskAttachment');
const Project = require('./Project');
const Organization = require('./Organization');
const OrganizationMember = require('./OrganizationMember');

// Task Associations
Task.hasMany(TaskAssignee, { 
  foreignKey: 'taskId',
  as: 'TaskAssignees' // This is the correct alias
});

Task.hasMany(TaskComment, {
  foreignKey: 'taskId',
  as: 'comments'
});

Task.hasMany(TaskHistory, {
  foreignKey: 'taskId',
  as: 'history'
});

Task.hasMany(TaskAttachment, {
  foreignKey: 'taskId',
  as: 'attachments'
});

Task.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project'
});

Task.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'organization'
});

// TaskAssignee Associations
TaskAssignee.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task'
});

// TaskComment Associations
TaskComment.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task'
});

// TaskHistory Associations
TaskHistory.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task'
});

// TaskAttachment Associations
TaskAttachment.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task'
});

// Project Associations
Project.hasMany(Task, {
  foreignKey: 'projectId',
  as: 'tasks'
});

Project.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'organization'
});

// Organization Associations
Organization.hasMany(Project, {
  foreignKey: 'organizationId',
  as: 'projects'
});

Organization.hasMany(Task, {
  foreignKey: 'organizationId',
  as: 'tasks'
});

Organization.hasMany(OrganizationMember, {
  foreignKey: 'organizationId',
  as: 'members'
});

// OrganizationMember Associations
OrganizationMember.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'organization'
});

module.exports = {
  Task,
  TaskAssignee,
  TaskComment,
  TaskHistory,
  TaskAttachment,
  Project,
  Organization,
  OrganizationMember
}; 