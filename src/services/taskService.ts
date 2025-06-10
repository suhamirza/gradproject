import { apiClients } from './httpClient';
import { API_CONFIG } from '../config/api';
import type { ApiError } from '../types/api';

// Local API call wrapper for task service
const taskApiCall = async <T>(
  client: any,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<T> => {
  try {
    const response = await client.request<T>({
      method,
      url: endpoint,
      data,
    });
    
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

// Task interfaces
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  organizationId: string;
  projectId: string;
  assignees: TaskAssignee[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignee {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  role: 'assignee' | 'reviewer';
  assignedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  organizationId: string;
  projectId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface CreateProjectRequest {
  organizationId: string;
  name: string;
  description?: string;
}

// Response interfaces
export interface CreateTaskResponse {
  message: string;
  task: Task;
}

export interface GetTasksResponse {
  message: string;
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateProjectResponse {
  message: string;
  project: Project;
}

export interface GetProjectsResponse {
  message: string;
  projects: Project[];
}

// Task service functions
export const taskService = {
  // Create a new project (list)
  createProject: async (data: CreateProjectRequest): Promise<CreateProjectResponse> => {
    console.log('taskService.createProject called with data:', data);
    
    const result = await taskApiCall<CreateProjectResponse>(
      apiClients.taskService,
      'POST',
      '/projects',
      data
    );
    
    console.log('taskService.createProject result:', result);
    return result;
  },

  // Get all projects for an organization
  getProjects: async (organizationId: string): Promise<GetProjectsResponse> => {
    return await taskApiCall<GetProjectsResponse>(
      apiClients.taskService,
      'GET',
      `/projects?organizationId=${organizationId}`
    );
  },

  // Create a new task
  createTask: async (data: CreateTaskRequest): Promise<CreateTaskResponse> => {
    console.log('taskService.createTask called with data:', data);
    
    const result = await taskApiCall<CreateTaskResponse>(
      apiClients.taskService,
      'POST',
      '/tasks',
      data
    );
    
    console.log('taskService.createTask result:', result);
    return result;
  },

  // Get all tasks for a project
  getTasks: async (organizationId: string, projectId?: string, status?: string, priority?: string): Promise<GetTasksResponse> => {
    let url = `/tasks?organizationId=${organizationId}`;
    if (projectId) url += `&projectId=${projectId}`;
    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;

    return await taskApiCall<GetTasksResponse>(
      apiClients.taskService,
      'GET',
      url
    );
  },

  // Update a task
  updateTask: async (taskId: string, organizationId: string, data: UpdateTaskRequest): Promise<Task> => {
    return await taskApiCall<Task>(
      apiClients.taskService,
      'PUT',
      `/tasks/${taskId}`,
      { ...data, organizationId }
    );
  },

  // Delete a task
  deleteTask: async (taskId: string, organizationId: string): Promise<void> => {
    await taskApiCall<void>(
      apiClients.taskService,
      'DELETE',
      `/tasks/${taskId}`,
      { organizationId }
    );
  },

  // Assign user to task
  assignUserToTask: async (taskId: string, organizationId: string, userId: string, role: 'assignee' | 'reviewer'): Promise<TaskAssignee> => {
    return await taskApiCall<TaskAssignee>(
      apiClients.taskService,
      'POST',
      `/tasks/${taskId}/assignees`,
      { organizationId, userId, role }
    );
  },

  // Add comment to task
  addTaskComment: async (taskId: string, organizationId: string, content: string): Promise<TaskComment> => {
    return await taskApiCall<TaskComment>(
      apiClients.taskService,
      'POST',
      `/tasks/${taskId}/comments`,
      { organizationId, content }
    );
  }
};
