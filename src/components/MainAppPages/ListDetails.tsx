import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";

// Compatibility helpers for React 19
const useMemo = React.useMemo || ((fn: any, _deps: any) => fn());
const forwardRef = React.forwardRef || ((Component: any) => Component);

type ReactNode = React.ReactNode;
type RefObject<T> = React.RefObject<T>;
type ChangeEvent<T> = React.ChangeEvent<T>;
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import {
  DndContext,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "../ReactBits/SortableItem";
import { FaPlus } from 'react-icons/fa';
import { taskService, type Task as BackendTask, type TaskAssignee, type TaskComment } from '../../services/taskService';
import { organizationService } from '../../services/organizationService';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useUser } from '../../context/UserContext';

// Updated Task interface to match backend
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  organizationId: string;
  projectId: string;
  assignees?: TaskAssignee[];
  comments?: TaskComment[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

interface Category {
  id: string;
  name: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  tasks: Task[];
}

// Categories that map to backend status values
const defaultCategories: Category[] = [
  {
    id: "1",
    name: "To Do",
    status: "todo",
    tasks: [],
  },
  {
    id: "2",
    name: "In Progress", 
    status: "in_progress",
    tasks: [],
  },
  {
    id: "3",
    name: "Completed",
    status: "completed",
    tasks: [],
  },
  {
    id: "4",
    name: "Blocked",
    status: "blocked",
    tasks: [],  },
];

interface Member {
  userId: string;
  userName: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

// Members will be fetched from organization data

interface DroppableCategoryProps {
  category: Category;
  children: ReactNode;
  isOver?: boolean;
  projectId: string;
  members: Member[];
}

interface NewTask {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  assignedUserId: string;
  attachments: File[];
}

const DroppableCategory = (forwardRef as any)(
  ({ category, children, isOver, projectId, members }: DroppableCategoryProps, ref: RefObject<HTMLDivElement>) => {
    const { setNodeRef } = useDroppable({
      id: category.id,
      data: {
        type: 'category',
        id: category.id
      }
    });

    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState<NewTask>({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      assignedUserId: '',
      attachments: []
    });    const workspace = useWorkspace() as any;
    const userCtx = useUser() as any;
    
    const currentWorkspace = workspace?.currentWorkspace;
    const user = userCtx?.user;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
        if (!currentWorkspace || !user) {
        alert('Please make sure you are logged in and have selected a workspace');
        return;
      }

      if (!projectId) {
        alert('No project selected');
        return;
      }

      try {
        const taskData = {
          organizationId: currentWorkspace.id,
          projectId: projectId,
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate || undefined,
          priority: newTask.priority as 'low' | 'medium' | 'high',
        };

        await taskService.createTask(taskData);
        
        // Reset form and close modal
        setNewTask({
          title: '',
          description: '',
          dueDate: '',
          priority: 'medium',
          assignedUserId: '',
          attachments: []
        });
        setShowAddTask(false);
        
        // Refresh tasks - this will be handled by the parent component
        window.location.reload(); // Temporary solution
      } catch (error) {
        console.error('Failed to create task:', error);
        alert('Failed to create task. Please try again.');
      }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setNewTask((prev: NewTask) => ({
          ...prev,
          attachments: Array.from(e.target.files || [])
        }));
      }
    };    const combinedRef = (node: HTMLDivElement) => {
      try {
        if (typeof ref === 'function') {
          (ref as any)(node);
        } else if (ref && 'current' in ref) {
          (ref as any).current = node;
        }
      } catch (e) {
        // Ignore ref errors
      }
      setNodeRef(node);
    };

    return (
      <div
        ref={combinedRef}
        className={`flex flex-col w-64 bg-white border-2 ${
          isOver ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-300'
        } rounded-lg shadow p-4 transition-all duration-200 min-h-[300px]`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{category.name}</h2>
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
              {category.tasks.length}
            </span>
            <button
              onClick={() => setShowAddTask(true)}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-[#5C346E] text-white hover:bg-[#7d4ea7] transition-colors"
              title="Add task"
            >
              <FaPlus size={11} />
            </button>
          </div>
        </div>
        <div className={`flex-1 ${category.tasks.length === 0 ? 'flex items-center justify-center' : ''}`}>
          {category.tasks.length === 0 ? (
            <div className={`w-full h-full flex items-center justify-center rounded-lg border-2 border-dashed transition-colors duration-200 ${
              isOver ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <span className={`text-sm font-medium ${isOver ? 'text-purple-600' : 'text-gray-400'}`}>
                Drop tasks here
              </span>
            </div>
          ) : (
            <div className={`space-y-2 ${isOver ? 'bg-purple-50 rounded-lg p-2' : ''}`}>
              {children}
            </div>
          )}
        </div>

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl border-2 border-[#5C346E] relative">
              <button
                className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
                onClick={() => setShowAddTask(false)}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-6 text-[#5C346E]">Add New Task</h3>
              
              <form onSubmit={handleSubmit}>
                {/* Task Title */}
                <div className="mb-4">
                  <label className="block text-[#5C346E] font-bold mb-2">Task Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E]"
                    placeholder="Enter task title..."
                    value={newTask.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      setNewTask((prev: NewTask) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                {/* Task Description */}
                <div className="mb-4">
                  <label className="block text-[#5C346E] font-bold mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E] resize-none"
                    placeholder="Enter task description..."
                    rows={3}
                    value={newTask.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => 
                      setNewTask((prev: NewTask) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Due Date */}
                <div className="mb-4">
                  <label className="block text-[#5C346E] font-bold mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E]"
                    value={newTask.dueDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      setNewTask((prev: NewTask) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                {/* Priority */}
                <div className="mb-4">
                  <label className="block text-[#5C346E] font-bold mb-2">Priority</label>
                  <select
                    className="w-full px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E] bg-white"
                    value={newTask.priority}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                      setNewTask((prev: NewTask) => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Assign To - Placeholder for now */}
                <div className="mb-4">
                  <label className="block text-[#5C346E] font-bold mb-2">Assign To</label>
                  <select
                    className="w-full px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E] bg-white"
                    value={newTask.assignedUserId}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                      setNewTask((prev: NewTask) => ({ ...prev, assignedUserId: e.target.value }))}                  >
                    <option value="">Select a member</option>
                    {members.map(member => (
                      <option key={member.userId} value={member.userId}>{member.userName}</option>
                    ))}
                  </select>
                </div>

                {/* Attachments - Placeholder for now */}
                <div className="mb-6">
                  <label className="block text-[#5C346E] font-bold mb-2">Attachments</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      multiple
                      className="w-full px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#5C346E] file:text-white hover:file:bg-[#7d4ea7]"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300"
                    onClick={() => setShowAddTask(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#5C346E] text-white font-bold hover:bg-[#7d4ea7]"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DroppableCategory.displayName = 'DroppableCategory';

const ListDetails = () => {
  const navigate = useNavigate();
  const { projectId, listName } = useParams<{ projectId: string; listName: string }>();
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [showMembersModal, setShowMembersModal] = useState(false);  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const workspace = useWorkspace() as any;
  const userCtx = useUser() as any;

  // Convert backend task to frontend task format
  const convertBackendTask = (backendTask: BackendTask): Task => {
    // Map backend status values to frontend status values
    let mappedStatus: 'todo' | 'in_progress' | 'completed' | 'blocked';
    switch (backendTask.status) {
      case 'todo':
        mappedStatus = 'todo';
        break;
      case 'in_progress':
        mappedStatus = 'in_progress';
        break;
      case 'completed':
        mappedStatus = 'completed';
        break;
      case 'blocked':
        mappedStatus = 'blocked';
        break;
      default:
        mappedStatus = 'todo';
        break;
    }

    return {
      ...backendTask,
      status: mappedStatus,
      isArchived: false, // Backend task might not have this field
    };
  };
  // Load tasks when component mounts or workspace changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!workspace?.currentWorkspace || !userCtx?.user) {
        setLoading(false);
        return;
      }      try {
        setLoading(true);
        
        // Fetch organization details to get members
        const orgResponse = await organizationService.getOrganizationById(workspace.currentWorkspace.id);
        setMembers(orgResponse.organization.allMembers);
        
        const response = await taskService.getTasks(workspace.currentWorkspace.id, projectId || undefined);
        const convertedTasks = response.tasks.map(convertBackendTask);
        
        // Organize tasks by status into categories
        const updatedCategories = defaultCategories.map(category => ({
          ...category,
          tasks: convertedTasks.filter(task => task.status === category.status)
        }));
        
        setCategories(updatedCategories);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };    loadTasks();
  }, [workspace, userCtx, projectId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragEndEvent) => {
    const { active } = event;
    setActiveTaskId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as string ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTaskId(null);
    setOverId(null);

    if (!over || !workspace?.currentWorkspace) return;

    const activeTaskId = active.id as string;
    const overContainerId = over.id as string;

    // Find source and destination categories
    const sourceCategory = categories.find((category: Category) =>
      category.tasks.some((task: Task) => task.id === activeTaskId)
    );

    const destinationCategory = categories.find((category: Category) =>
      category.id === overContainerId
    );

    if (!sourceCategory || !destinationCategory || sourceCategory.id === destinationCategory.id) {
      return;
    }

    const taskToMove = sourceCategory.tasks.find((task: Task) => task.id === activeTaskId);    if (!taskToMove) return;

    try {
      // Map frontend status to backend status
      let backendStatus: 'todo' | 'in_progress' | 'completed' | 'blocked';
      switch (destinationCategory.status) {
        case 'todo':
          backendStatus = 'todo';
          break;
        case 'in_progress':
          backendStatus = 'in_progress';
          break;
        case 'completed':
          backendStatus = 'completed';
          break;
        case 'blocked':
          backendStatus = 'blocked';
          break;
        default:
          backendStatus = 'todo';
          break;
      }      // Update task status on backend
      await taskService.updateTask(activeTaskId, workspace.currentWorkspace.id, {
        status: backendStatus
      });

      // Update local state
      setCategories((prevCategories: Category[]) => {
        return prevCategories.map(category => {
          if (category.id === sourceCategory.id) {
            return {
              ...category,
              tasks: category.tasks.filter(task => task.id !== activeTaskId)
            };
          } else if (category.id === destinationCategory.id) {
            return {
              ...category,
              tasks: [...category.tasks, { ...taskToMove, status: destinationCategory.status }]
            };
          }
          return category;
        });
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };
  const handleViewTaskDetails = (taskId: string) => {
    const task = categories
      .flatMap((category: Category) => category.tasks)
      .find((task: Task) => task.id === taskId);
    if (task) {
      setSelectedTask(task);
    }
  };
  const handleDeleteTask = async (taskId: string) => {
    if (!workspace?.currentWorkspace) {
      alert('Please select a workspace to delete tasks.');
      return;
    }

    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete || !workspace?.currentWorkspace) {
      return;
    }

    try {
      await taskService.deleteTask(taskToDelete, workspace.currentWorkspace.id);
      
      // Update local state by removing the task from categories
      setCategories((prevCategories: Category[]) => {
        return prevCategories.map(category => ({
          ...category,
          tasks: category.tasks.filter(task => task.id !== taskToDelete)
        }));
      });

      // Close the task details modal if it's the deleted task
      if (selectedTask?.id === taskToDelete) {
        setSelectedTask(null);
      }

      // Close confirmation modal and reset state
      setShowDeleteConfirm(false);
      setTaskToDelete(null);

      alert('Task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    return categories
      .flatMap((category: Category) => category.tasks)
      .find((task: Task) => task.id === activeTaskId) || null;
  }, [activeTaskId, categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }
  if (!workspace?.currentWorkspace || !userCtx?.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Please select a workspace and log in to view tasks.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-[#5C346E]">
            {listName || 'Task Board'}
          </h1>
        </div>
        <button
          onClick={() => setShowMembersModal(true)}
          className="px-4 py-2 bg-[#5C346E] text-white rounded-lg hover:bg-[#7d4ea7] transition-colors"
        >
          View Members
        </button>
      </div>

      {/* Categories */}
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always
          }
        }}
      >
        <div className="flex-1 p-6 overflow-x-auto">
          <div className="flex gap-6 min-w-fit">
            {categories.map((category: Category) => (              <SortableContext
                items={category.tasks.map((task: Task) => task.id)}
                strategy={verticalListSortingStrategy}
              >                <DroppableCategory
                  category={category}
                  isOver={overId === category.id}
                  projectId={projectId || ''}
                  members={members}
                >{category.tasks.map((task: Task) => (
                    <SortableItem
                      id={task.id}
                      text={task.title}
                      details={task.description}
                      deadline={task.dueDate}
                      assignedTo={task.assignees?.[0]?.userName}
                      attachments={[]} // TODO: implement attachments
                      onViewDetails={() => handleViewTaskDetails(task.id)}
                    />
                  ))}
                </DroppableCategory>
              </SortableContext>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-purple-500 opacity-90">
              <div className="font-medium text-gray-900">{activeTask.title}</div>
              {activeTask.description && (
                <div className="text-sm text-gray-600 mt-1">{activeTask.description}</div>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl border-2 border-[#5C346E] relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
              onClick={() => setSelectedTask(null)}
            >
              &times;
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-[#5C346E]">Task Details</h3>
            
            {/* Task Title */}
            <div className="mb-4">
              <label className="block text-[#5C346E] font-bold mb-2">Title</label>
              <div className="px-4 py-2 bg-purple-50 rounded-xl">{selectedTask.title}</div>
            </div>

            {/* Task Description */}
            {selectedTask.description && (
              <div className="mb-4">
                <label className="block text-[#5C346E] font-bold mb-2">Description</label>
                <div className="px-4 py-2 bg-purple-50 rounded-xl">
                  {selectedTask.description}
                </div>
              </div>
            )}

            {/* Due Date */}
            {selectedTask.dueDate && (
              <div className="mb-4">
                <label className="block text-[#5C346E] font-bold mb-2">Due Date</label>
                <div className="px-4 py-2 bg-purple-50 rounded-xl">
                  {new Date(selectedTask.dueDate).toLocaleString()}
                </div>
              </div>
            )}

            {/* Priority */}
            <div className="mb-4">
              <label className="block text-[#5C346E] font-bold mb-2">Priority</label>
              <div className="px-4 py-2 bg-purple-50 rounded-xl capitalize">
                {selectedTask.priority}
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-[#5C346E] font-bold mb-2">Status</label>
              <div className="px-4 py-2 bg-purple-50 rounded-xl capitalize">
                {selectedTask.status.replace('_', ' ')}
              </div>
            </div>

            {/* Assignees */}
            {selectedTask.assignees && selectedTask.assignees.length > 0 && (
              <div className="mb-4">
                <label className="block text-[#5C346E] font-bold mb-2">Assignees</label>
                <div className="space-y-2">
                  {selectedTask.assignees.map((assignee: TaskAssignee) => (
                    <div key={assignee.id} className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-xl">
                      <div className="w-8 h-8 bg-[#5C346E] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {assignee.userName?.slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <span>{assignee.userName || 'Unknown User'}</span>
                      <span className="ml-auto text-sm text-gray-600 capitalize">({assignee.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            {selectedTask.comments && selectedTask.comments.length > 0 && (
              <div className="mb-6">
                <label className="block text-[#5C346E] font-bold mb-2">Comments</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedTask.comments.map((comment: TaskComment) => (
                    <div key={comment.id} className="px-4 py-2 bg-purple-50 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1">
                        {comment.userName || 'Unknown User'} - {new Date(comment.createdAt).toLocaleString()}
                      </div>
                      <div>{comment.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}            <div className="flex justify-end gap-4">
              <button
                className="px-6 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                onClick={() => handleDeleteTask(selectedTask.id)}
              >
                Delete Task
              </button>
              <button
                className="px-6 py-2 rounded-xl bg-[#5C346E] text-white font-bold hover:bg-[#7d4ea7]"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border-2 border-[#5C346E] relative">
            <button
              className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
              onClick={() => setShowMembersModal(false)}
            >
              &times;
            </button>
            
            <h3 className="text-xl font-bold mb-6 text-[#5C346E]">Project Members</h3>
              <div className="space-y-3">
              {members.map((member) => (
                <div key={member.userId} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-[#5C346E] text-white rounded-full flex items-center justify-center font-bold">
                    {member.userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium">{member.userName}</span>
                  <span className="ml-auto text-sm text-gray-600 capitalize">({member.role})</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                className="px-6 py-2 rounded-xl bg-[#5C346E] text-white font-bold hover:bg-[#7d4ea7]"
                onClick={() => setShowMembersModal(false)}
              >
                Close
              </button>
            </div>          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border-2 border-red-200 relative animate-pulse">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold mb-4 text-gray-900">Delete Task</h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to delete this task? This action cannot be undone and will permanently remove the task and all its data.
              </p>
              
              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors"
                  onClick={cancelDeleteTask}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg"
                  onClick={confirmDeleteTask}
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListDetails;
