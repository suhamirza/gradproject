const Organization = require("../models/Organization");
const Project = require("../models/Project");
const Task = require("../models/Task");
const OrganizationMember = require("../models/OrganizationMember");
const TaskAssignee = require("../models/TaskAssignee");
const TaskComment = require("../models/TaskComment");
const TaskHistory = require("../models/TaskHistory");

const express = require("express");
const router = express.Router();





// Create a new task
router.post("/", async (req, res) => {
  try {
    const { projectId, title, description, dueDate, priority } = req.body;
    const userId = req.user.nameid;

    // Verify project exists and belongs to organization
    const project = await Project.findOne({
      where: {
        id: projectId,
        organizationId: req.body.organizationId,
        isArchived: false
      }
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const task = await Task.create({
      organizationId: req.body.organizationId,
      projectId,
      title,
      description,
      dueDate,
      priority: priority || 'medium',
      status: 'todo'
    });

    // Create task history entry
    await TaskHistory.create({
      taskId: task.id,
      fieldChanged: 'status',
      oldValue: null,
      newValue: 'todo',
      changedBy: userId
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Get task details
router.get("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { organizationId } = req.query;

    console.log(`Fetching task details for taskId: ${taskId}, organizationId: ${organizationId}`);

    // First check if task exists and belongs to organization
    const taskExists = await Task.findOne({
      where: {
        id: taskId,
        organizationId: organizationId
      }
    });

    if (!taskExists) {
      console.log(`Task not found: ${taskId}`);
      return res.status(404).json({ error: "Task not found" });
    }

    // Then fetch task with all related data
    const task = await Task.findOne({
      where: {
        id: taskId,
        organizationId: organizationId
      },
      include: [
        {
          model: TaskAssignee,
          as: 'TaskAssignees',
          required: false
        },
        {
          model: TaskComment,
          as: 'comments',
          where: { isDeleted: false },
          required: false
        }
      ]
    });

    if (!task) {
      console.log(`Task fetch failed for taskId: ${taskId}`);
      return res.status(500).json({ 
        error: "Failed to fetch task details",
        details: "Task exists but failed to load related data"
      });
    }

    console.log(`Successfully fetched task: ${taskId}`);
    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ 
      error: "Failed to fetch task",
      details: error.message
    });
  }
});

// Update a task
router.put("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { organizationId, title, description, dueDate, priority, status } = req.body;
    const userId = req.user.nameid;

    console.log(`Updating task ${taskId} with data:`, {
      organizationId,
      title,
      description,
      dueDate,
      priority,
      status
    });

    // First verify task exists and belongs to organization
    const taskExists = await Task.findOne({
      where: {
        id: taskId,
        organizationId: organizationId
      }
    });

    if (!taskExists) {
      console.log(`Task not found: ${taskId}`);
      return res.status(404).json({ error: "Task not found" });
    }

    // Track changes for history
    const changes = [];
    const updateData = {};

    if (title && title !== taskExists.title) {
      changes.push({ field: 'title', oldValue: String(taskExists.title), newValue: String(title) });
      updateData.title = title;
    }

    if (description !== undefined && description !== taskExists.description) {
      changes.push({ 
        field: 'description', 
        oldValue: String(taskExists.description || ''), 
        newValue: String(description || '') 
      });
      updateData.description = description;
    }

    if (dueDate && dueDate !== taskExists.dueDate) {
      // Convert existing dueDate to ISO string if it's a Date object
      const oldDueDate = taskExists.dueDate instanceof Date ? 
        taskExists.dueDate.toISOString() : 
        String(taskExists.dueDate || '');
      
      // Ensure new dueDate is in ISO string format
      const newDueDate = dueDate instanceof Date ? 
        dueDate.toISOString() : 
        String(dueDate);

      changes.push({ 
        field: 'dueDate', 
        oldValue: oldDueDate, 
        newValue: newDueDate 
      });
      updateData.dueDate = dueDate;
    }

    if (priority && priority !== taskExists.priority) {
      changes.push({ 
        field: 'priority', 
        oldValue: String(taskExists.priority), 
        newValue: String(priority) 
      });
      updateData.priority = priority;
    }

    if (status && status !== taskExists.status) {
      changes.push({ 
        field: 'status', 
        oldValue: String(taskExists.status), 
        newValue: String(status) 
      });
      updateData.status = status;
    }

    if (changes.length === 0) {
      console.log(`No changes detected for task ${taskId}`);
      return res.json(taskExists);
    }

    console.log(`Updating task ${taskId} with changes:`, changes);

    // Update the task
    const [updatedRows] = await Task.update(updateData, {
      where: {
        id: taskId,
        organizationId: organizationId
      },
      returning: true
    });

    if (updatedRows === 0) {
      console.log(`Failed to update task ${taskId}`);
      return res.status(500).json({ 
        error: "Failed to update task",
        details: "No rows were updated"
      });
    }

    // Create history entries for each change
    for (const change of changes) {
      await TaskHistory.create({
        taskId,
        fieldChanged: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        changedBy: userId
      });
    }

    // Fetch the updated task with all relations
    const updatedTask = await Task.findOne({
      where: {
        id: taskId,
        organizationId: organizationId
      },
      include: [
        {
          model: TaskAssignee,
          as: 'TaskAssignees',
          required: false
        },
        {
          model: TaskComment,
          as: 'comments',
          where: { isDeleted: false },
          required: false
        }
      ]
    });

    console.log(`Successfully updated task ${taskId}`);
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ 
      error: "Failed to update task",
      details: error.message
    });
  }
});

// Delete a task
router.delete("/:taskId", async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.taskId,
        organizationId: req.body.organizationId
      }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await task.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// List tasks
router.get("/", async (req, res) => {
  try {
    const { projectId, status, priority, page = 1, limit = 10 } = req.query;
    const { organizationId } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      organizationId: organizationId
    };

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await Task.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: TaskAssignee,
          as: 'TaskAssignees',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      tasks: tasks.rows,
      total: tasks.count,
      page: parseInt(page),
      totalPages: Math.ceil(tasks.count / limit)
    });
  } catch (error) {
    console.error("Error listing tasks:", error);
    res.status(500).json({ 
      error: "Failed to list tasks",
      details: error.message
    });
  }
});

// Assign user to task
router.post("/:taskId/assignees", async (req, res) => {
  try {
    const { userId, role } = req.body;
    const taskId = req.params.taskId;

    const task = await Task.findOne({
      where: {
        id: taskId,
        organizationId: req.body.organizationId
      }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    

    const assignee = await TaskAssignee.create({
      taskId,
      userId,
      role,
      assignedBy: req.user.nameid
    });

    // Create history entry
    await TaskHistory.create({
      taskId,
      fieldChanged: 'assignee',
      oldValue: null,
      newValue: `${userId} (${role})`,
      changedBy: req.user.nameid
    });

    res.status(201).json(assignee);
  } catch (error) {
    console.error("Error assigning user to task:", error);
    res.status(500).json({ error: "Failed to assign user to task" });
  }
});

// Add comment to task
router.post("/:taskId/comments", async (req, res) => {
  try {
    const { content } = req.body;
    const taskId = req.params.taskId;

    const task = await Task.findOne({
      where: {
        id: taskId,
        organizationId: req.body.organizationId
      }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const comment = await TaskComment.create({
      taskId,
      userId: req.user.nameid,
      content
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Get task history
router.get("/:taskId/history", async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.taskId,
        organizationId: req.body.organizationId
      }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const history = await TaskHistory.findAll({
      where: { taskId: task.id },
      order: [['changedAt', 'DESC']]
    });

    res.json(history);
  } catch (error) {
    console.error("Error fetching task history:", error);
    res.status(500).json({ error: "Failed to fetch task history" });
  }
});

module.exports = router;
