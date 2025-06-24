import {
  type ReactNode,
  type RefObject,
  type ChangeEvent,
  useState,
  useMemo,
  forwardRef,
  useEffect,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    tasks: [],
  },
];

// Members will be fetched from organization data
const dummyMembers = ["Suha Mirza", "Yahya", "Muhammad", "Vedat", "Aisha"];

interface DroppableCategoryProps {
  category: Category;
  children: ReactNode;
  isOver?: boolean;
}

interface NewTask {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedUserId: string;
  attachments: File[];
}

const DroppableCategory = forwardRef<HTMLDivElement, DroppableCategoryProps>(
  ({ category, children, isOver }: DroppableCategoryProps, ref: RefObject<HTMLDivElement>) => {
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
    });

    const { currentWorkspace } = useWorkspace();
    const { user } = useUser();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!currentWorkspace || !user) {
        alert('Please make sure you are logged in and have selected a workspace');
        return;
      }

      // For now, we'll need a projectId - this should be passed as a prop or from URL params
      // This is a temporary solution - you should get the actual projectId from your route or props
      const projectId = new URLSearchParams(window.location.search).get('projectId') || 'temp-project-id';

      try {
        const taskData = {
          organizationId: currentWorkspace.id,
          projectId: projectId,
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate || undefined,
          priority: newTask.priority,
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
    };

    const combinedRef = (node: HTMLDivElement) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
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
                      setNewTask((prev: NewTask) => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Assign To - Placeholder for now */}
                <div className="mb-4">
                  <label className="block text-[#5C346E] font-bold mb-2">Assign To</label>
                  <select
                    className="w-full px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E] bg-white"
                    value={newTask.assignedUserId}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                      setNewTask((prev: NewTask) => ({ ...prev, assignedUserId: e.target.value }))}
                  >
                    <option value="">Select a member</option>
                    {dummyMembers.map(member => (
                      <option key={member} value={member}>{member}</option>
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
  const { listName } = useParams<{ listName: string }>();
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const { currentWorkspace } = useWorkspace();
  const { user } = useUser();

  // Load tasks when component mounts or workspace changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentWorkspace || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get projectId from URL params - you might need to adjust this based on your routing
        const projectId = new URLSearchParams(window.location.search).get('projectId');
        
        const response = await taskService.getTasks(currentWorkspace.id, projectId || undefined);
        setTasks(response.tasks);
        
        // Organize tasks by status into categories
        const updatedCategories = defaultCategories.map(category => ({
          ...category,
          tasks: response.tasks.filter(task => task.status === category.status)
        }));
        
        setCategories(updatedCategories);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [currentWorkspace, user]);

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

    if (!over || !currentWorkspace) return;

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

    const taskToMove = sourceCategory.tasks.find((task: Task) => task.id === activeTaskId);
    if (!taskToMove) return;

    try {
      // Update task status on backend
      await taskService.updateTask(activeTaskId, currentWorkspace.id, {
        status: destinationCategory.status
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

  if (!currentWorkspace || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Please select a workspace and log in to view tasks.</div>
      </div>
    );
  }
        if (!taskToMove) return prevCategories;

        return prevCategories.map((category: Category) => {
          if (category.id === sourceCategory.id) {
            return {
              ...category,
              tasks: category.tasks.filter((task: Task) => task.id !== activeTaskId)
            };
          }
          if (category.id === destinationCategory.id) {
            return {
              ...category,
              tasks: [...category.tasks, taskToMove]
            };
          }
          return category;
        });
      });
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

  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    return categories
      .flatMap((category: Category) => category.tasks)
      .find((task: Task) => task.id === activeTaskId) || null;
  }, [activeTaskId, categories]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/lists')}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#5C346E] hover:bg-[#f7f0ff] transition-colors"
            title="Back to Lists"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">{listName}</h1>
          <div className="flex flex-row gap-2 relative">
            {dummyMembers.slice(0, 5).map((member, idx) => (
              <div
                key={member}
                className="w-11 h-11 rounded-full bg-[#e9e0f3] flex items-center justify-center font-bold text-[#5C346E] text-lg border-2 border-white shadow"
                title={member}
                style={{ zIndex: 10 - idx, marginLeft: idx === 0 ? 0 : -25 }}
              >
                {member.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            ))}
            {dummyMembers.length > 5 && (
              <button
                className="flex items-center px-2 h-11 ml-[-25px] bg-transparent relative z-0 hover:bg-[#f7f0ff] rounded-full border-none outline-none transition"
                style={{ border: "none" }}
                title="Show all members"
                onClick={() => setShowMembersModal(true)}
              >
                <span className="text-xl text-[#5C346E] ml-2" style={{ letterSpacing: "2px" }}>...</span>
                <span className="text-xl text-[#5C346E] font-bold">+</span>
              </button>
            )}
          </div>
        </div>
        <span className="text-sm text-gray-500">ID: #726849</span>
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
        <div className="flex-1 flex gap-4 p-6 overflow-x-auto">
          {categories.map((category: Category) => (
            <DroppableCategory 
              key={category.id} 
              category={category}
              isOver={overId === category.id}
            >
              <SortableContext
                items={category.tasks.map((task: Task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {category.tasks.map((task: Task) => (
                  <SortableItem 
                    key={task.id} 
                    id={task.id} 
                    text={task.text}
                    details={task.details}
                    deadline={task.deadline}
                    assignedTo={task.assignedTo}
                    attachments={task.attachments}
                    onViewDetails={() => handleViewTaskDetails(task.id)}
                  />
                ))}
              </SortableContext>
            </DroppableCategory>
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <div className="bg-purple-100 text-gray-800 p-3 rounded-lg shadow opacity-90 cursor-grabbing select-none">
              {activeTask.text}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl border-2 border-[#5C346E] relative">
            <button
              className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
              onClick={() => setSelectedTask(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-6 text-[#5C346E]">Task Details</h3>
            
            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-[#5C346E] font-bold mb-1">Task Title</label>
                <div className="px-4 py-2 bg-purple-50 rounded-xl">{selectedTask.text}</div>
              </div>

              {/* Task Details */}
              {selectedTask.details && (
                <div>
                  <label className="block text-[#5C346E] font-bold mb-1">Details</label>
                  <div className="px-4 py-2 bg-purple-50 rounded-xl whitespace-pre-wrap">
                    {selectedTask.details}
                  </div>
                </div>
              )}

              {/* Deadline */}
              {selectedTask.deadline && (
                <div>
                  <label className="block text-[#5C346E] font-bold mb-1">Deadline</label>
                  <div className="px-4 py-2 bg-purple-50 rounded-xl">
                    {new Date(selectedTask.deadline).toLocaleString()}
                  </div>
                </div>
              )}

              {/* Assigned To */}
              {selectedTask.assignedTo && (
                <div>
                  <label className="block text-[#5C346E] font-bold mb-1">Assigned To</label>
                  <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#e9e0f3] flex items-center justify-center font-bold text-[#5C346E] text-sm border-2 border-white shadow">
                      {selectedTask.assignedTo.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <span>{selectedTask.assignedTo}</span>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div>
                  <label className="block text-[#5C346E] font-bold mb-1">Attachments</label>
                  <div className="space-y-2">
                    {selectedTask.attachments.map((file: string, index: number) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#5C346E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-8">
              <button
                className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300"
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
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl border-2 border-[#5C346E] relative">
            <button
              className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
              onClick={() => setShowMembersModal(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-[#5C346E]">List Members</h3>
            <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
              {dummyMembers.map((member) => (
                <div key={member} className="flex items-center gap-3 px-2 py-2 bg-[#f7f0ff] rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-[#e9e0f3] flex items-center justify-center font-bold text-[#5C346E] text-base border-2 border-white shadow">
                    {member.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-[#5C346E]">{member}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListDetails;
