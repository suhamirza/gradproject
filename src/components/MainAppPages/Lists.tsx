// @ts-nocheck
import { useState, useEffect } from 'react';
import { FaLock, FaPlus, FaTrash, FaPencilAlt, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useUser } from '../../context/UserContext';
import * as TaskService from '../../services/taskService';
import { organizationService, type OrganizationMember } from '../../services/organizationService';
import { chatService } from '../../services/chatService';
import FadeContent from '../../components/ReactBits/FadeContent';

// Extract the types we need
type Project = TaskService.Project;
type CreateProjectRequest = TaskService.CreateProjectRequest;

type ListTag = {
  label: string;
  color: string;
  preset?: boolean;
};

const PRESET_TAGS: ListTag[] = [
  { label: 'Urgent', color: '#fee2e2', preset: true }, // red
  { label: 'Personal', color: '#dbeafe', preset: true }, // blue
  { label: 'Work', color: '#ede9fe', preset: true }, // purple
];

interface ProjectWithTag extends Project {
  tag?: ListTag | null;
  mockId?: string; // Stable ID for React rendering
  apiId?: string; // Real API ID when available
  visibility?: 'public' | 'private'; // Frontend-only visibility setting
}

const Lists: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Use useWorkspace with fallback
  let currentWorkspace = null;
  let workspaceLoading = false;
  
  try {
    const context = useWorkspace();
    currentWorkspace = context.currentWorkspace;
    workspaceLoading = context.isLoading;
  } catch (error) {
    // Context not available, use fallback
    console.warn('WorkspaceContext not available, using fallback');
  }
    const [projects, setProjects] = useState<ProjectWithTag[]>([]);
  const [loading, setLoading] = useState(false); // Start with false, only set to true when actually loading
  const [workspaceMembers, setWorkspaceMembers] = useState<OrganizationMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListMembers, setNewListMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [newListVisibility, setNewListVisibility] = useState<'public' | 'private'>('private');
  const [newListTagType, setNewListTagType] = useState<'preset'|'custom'|''>('');
  const [newListTagPreset, setNewListTagPreset] = useState<ListTag|null>(null);
  const [newListTagCustom, setNewListTagCustom] = useState<{label: string, color: string}>({label: '', color: '#c7b3d6'});
  const [deleteConfirm, setDeleteConfirm] = useState<string|null>(null);
  const [showMembersModal, setShowMembersModal] = useState<string|null>(null);
  const [membersSearch, setMembersSearch] = useState('');
  const [editListModal, setEditListModal] = useState<string|null>(null);
  const [editTagType, setEditTagType] = useState<'preset'|'custom'|''>('');
  const [editTagPreset, setEditTagPreset] = useState<ListTag|null>(null);
  const [editTagCustom, setEditTagCustom] = useState<{label: string, color: string}>({label: '', color: '#c7b3d6'});
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [editListVisibility, setEditListVisibility] = useState<'private' | 'public'>('private');
  const [editMemberSearch, setEditMemberSearch] = useState('');  // Load projects when workspace changes
  useEffect(() => {
    const loadProjects = async () => {
      console.log('🔄 Lists.tsx: loadProjects called, currentWorkspace:', currentWorkspace);
      console.log('🔄 Lists.tsx: workspaceLoading:', workspaceLoading);
      
      if (!currentWorkspace) {
        console.log('⏸️ Lists.tsx: No currentWorkspace, skipping project load');
        return;
      }
      
      try {
        console.log('📥 Lists.tsx: Starting to load projects for workspace:', currentWorkspace.id);
        setLoading(true);
        const projects = await TaskService.taskService.getProjects(currentWorkspace.id);
        console.log('✅ Lists.tsx: Projects loaded successfully:', projects.length, 'projects');
        
        const projectsWithTags = projects.map((project: Project) => ({
          ...project,
          tag: null as ListTag | null,
          visibility: 'private' as 'public' | 'private' // Default visibility for existing projects
        }));
        setProjects(projectsWithTags);
      } catch (error) {
        console.error('❌ Lists.tsx: Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };    // Only load if we're not currently loading the workspace
    if (!workspaceLoading) {
      loadProjects();
    } else {
      console.log('⏳ Lists.tsx: Workspace is loading, waiting...');
      // Reset loading state if workspace is loading
      setLoading(false);
    }
  }, [currentWorkspace, workspaceLoading]);

  // Load workspace members
  useEffect(() => {
    const loadWorkspaceMembers = async () => {
      if (!currentWorkspace) return;
      
      try {
        const response = await organizationService.getOrganizationMembers(currentWorkspace.id);
        setWorkspaceMembers(response.members);
      } catch (error) {
        console.error('Failed to load workspace members:', error);
      }
    };

    loadWorkspaceMembers();
  }, [currentWorkspace]);

  // Filtered members for dropdown
  const filteredMembers = workspaceMembers.filter(m =>
    m.userName.toLowerCase().includes(memberSearch.toLowerCase()) && !newListMembers.includes(m.userName)
  ).sort((a, b) => a.userName.localeCompare(b.userName));

  const handleAddList = async () => {
    console.log('=== CREATE LIST DEBUG ===');
    console.log('newListTitle:', newListTitle);
    console.log('currentWorkspace:', currentWorkspace);
    
    if (!newListTitle.trim()) {
      alert('Please enter a list name');
      return;
    }

    // TEMPORARY FIX - Create mock project locally until backend is working
    try {
      let tag: ListTag | null = null;
      if (newListTagType === 'preset' && newListTagPreset) tag = newListTagPreset;
      if (newListTagType === 'custom' && newListTagCustom.label) tag = { label: newListTagCustom.label, color: newListTagCustom.color };      // Create a mock project for now
      const mockId = 'temp-' + Date.now();      const mockProject: ProjectWithTag = {
        id: mockId,
        name: newListTitle,
        description: newListDescription || 'describe your list...',
        organizationId: currentWorkspace?.id || 'mock-workspace',
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tag,
        mockId: mockId, // Add stable mockId from the start
        visibility: newListVisibility // Add visibility setting
      };      console.log('✅ Creating mock project:', mockProject);

      setProjects(prev => [...prev, mockProject]);
      setShowModal(false);
      setNewListTitle('');
      setNewListDescription('');
      setNewListTagType('');
      setNewListTagPreset(null);
      setNewListTagCustom({ label: '', color: '#c7b3d6' });
      setNewListMembers([]);
      setNewListVisibility('private');
      
      console.log('✅ Project created successfully (MOCK)!');      // Auto-create a chat for this list (immediate)
      if (currentWorkspace) {
        try {
          // Get member names and filter out current user (backend will add creator automatically)
          const allMemberNames = newListMembers.map(m => m.userName || m);
          const chatMembers = allMemberNames.filter(name => name !== user?.username);
          
          console.log('🗨️ Creating auto-chat with members:', chatMembers, '(excluding current user)');
          
          await chatService.createChannel(
            currentWorkspace.id,
            `${newListTitle} Discussion`, // Chat name based on list name
            'public', // Default to public
            chatMembers // Don't include current user, backend should handle that
          );
          
          console.log('✅ Auto-created chat for list immediately');
        } catch (chatError) {
          console.error('Failed to create chat for list:', chatError);
          // Don't block list creation if chat creation fails
        }
      }
      
      // Try to call real API in background but don't block UI
      if (currentWorkspace) {
        try {
          const projectRequest: CreateProjectRequest = {
            name: newListTitle,
            description: newListDescription || 'describe your list...',
            organizationId: currentWorkspace.id
          };            console.log('📝 Attempting real API call in background...');
          const apiProject = await TaskService.taskService.createProject(projectRequest);          console.log('✅ Real API success:', apiProject);
            // Validate response structure
          if (apiProject && apiProject.id) {            // Update the mock project with real data while preserving stable key
            setProjects(prev => prev.map(p => 
              p.id === mockProject.id ? { 
                ...apiProject, 
                tag,
                // Keep the mock ID as the primary ID for React rendering stability
                id: mockProject.id, 
                // Store the real API ID separately
                apiId: apiProject.id,
                mockId: mockProject.mockId,
                // Preserve frontend-only visibility setting
                visibility: mockProject.visibility
              } : p
            ));
            console.log('✅ Mock project updated with real API data');            // Don't create another chat here since we already created one immediately
            // The chat was already created when the mock project was created
          } else {
            console.warn('⚠️ API response missing project data:', apiProject);
            // Keep the mock project as-is if API fails
          }
        } catch (error) {
          console.warn('⚠️ Real API failed, keeping mock project:', error);
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to create project:', error);
      alert('Failed to create project: ' + (error.message || 'Unknown error'));
    }
  };
  const handleDeleteList = async (id: string) => {
    try {
      const projectToDelete = projects.find(p => p.id === id);
      if (!projectToDelete) {
        console.warn('Project not found for deletion:', id);
        return;
      }

      // If it's a mock project (has mockId but no apiId), just remove locally
      if (projectToDelete.mockId && !projectToDelete.apiId) {
        console.log('Deleting mock project locally:', id);
        setProjects(prev => prev.filter(p => p.id !== id));
        setDeleteConfirm(null);
        return;
      }      // For real projects, call the API
      const projectIdToDelete = projectToDelete.apiId || projectToDelete.id;
      console.log('Deleting real project via API:', projectIdToDelete);
      console.log('Project organizationId:', projectToDelete.organizationId);
      
      await TaskService.taskService.deleteProject(projectIdToDelete, projectToDelete.organizationId);
      
      // Remove from local state after successful API call
      setProjects(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
      
      console.log('✅ Project deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete project:', error);
      alert('Failed to delete project: ' + (error?.message || 'Unknown error'));
    }
  };

  const openEditModal = (project: ProjectWithTag) => {
    setEditListModal(project.id);
    if (!project.tag) {
      setEditTagType('');
      setEditTagPreset(null);
      setEditTagCustom({ label: '', color: '#c7b3d6' });
    } else if (project.tag.preset) {
      setEditTagType('preset');
      setEditTagPreset(PRESET_TAGS.find(t => t.label === project.tag!.label) || null);
      setEditTagCustom({ label: '', color: '#c7b3d6' });
    } else {
      setEditTagType('custom');
      setEditTagPreset(null);
      setEditTagCustom({ label: project.tag.label, color: project.tag.color });
    }    // For now, use empty members array since we need to implement project members
    setEditMembers([]);
    setEditListVisibility(project.visibility || 'private'); // Use actual project visibility
    setEditMemberSearch('');
  };

  const handleSaveEdit = async () => {
    if (!editListModal) return;
    
    try {
      let tag: ListTag | null = null;
      if (editTagType === 'preset' && editTagPreset) tag = editTagPreset;
      if (editTagType === 'custom' && editTagCustom.label) tag = { label: editTagCustom.label, color: editTagCustom.color };      // Update the project locally (for tag and visibility)
      setProjects(prev => prev.map(p => 
        p.id === editListModal 
          ? { ...p, tag, visibility: editListVisibility } 
          : p
      ));
      setEditListModal(null);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleTitleChange = async (projectId: string, newTitle: string) => {
    try {
      // Update locally immediately
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, name: newTitle } : p
      ));
      
      // Note: updateProject doesn't exist in current API, so we'll only update locally for now
    } catch (error) {
      console.error('Failed to update project title:', error);
    }
  };

  const handleDescriptionChange = async (projectId: string, newDescription: string) => {
    try {
      // Update locally immediately
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, description: newDescription } : p
      ));
      
      // Note: updateProject doesn't exist in current API, so we'll only update locally for now
    } catch (error) {
      console.error('Failed to update project description:', error);
    }
  };  if (workspaceLoading) {
    console.log('📋 Lists.tsx: Showing workspace loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#5C346E] text-lg">Loading workspace...</div>
      </div>
    );
  }

  if (!currentWorkspace) {
    console.log('📋 Lists.tsx: No workspace available');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#5C346E] text-lg">No workspace selected. Please select a workspace.</div>
      </div>
    );
  }

  if (loading) {
    console.log('📋 Lists.tsx: Showing projects loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#5C346E] text-lg">Loading projects...</div>
      </div>
    );
  }

  console.log('🎯 Lists.tsx: Rendering projects, count:', projects.length);

  return (
    <FadeContent duration={900} delay={100}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-6 w-full">        {/* Project Previews */}
        {projects.map((project) => (
          <FadeContent key={project.mockId || project.id} duration={900} delay={100}>            <div
              className="relative bg-white border-2 border-[#5C346E] rounded-2xl p-6 min-h-[320px] flex flex-col justify-between shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/app/lists/${project.id}/${encodeURIComponent(project.name)}`)}
            >
              {/* Title (editable) */}
              <input
                type="text"
                value={project.name}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  handleTitleChange(project.id, e.target.value);
                }}
                className="font-extrabold text-3xl mb-4 bg-transparent outline-none border-none w-full"
                placeholder="Title.."
              />
              {/* Members Placeholder - For now showing empty since Project doesn't have members */}
              <div className="flex flex-row gap-2 mb-4 min-h-[44px]">
                <div className="text-gray-400 text-sm">No members yet</div>
              </div>
              {/* Description (editable) */}
              <div className="mb-3">
                <textarea
                  value={project.description || ''}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleDescriptionChange(project.id, e.target.value);
                  }}
                  className="w-full mt-2 px-2 py-1 rounded-lg border border-[#e9e0f3] bg-[#faf7fd] text-[#5C346E] font-normal text-sm resize-none focus:border-[#5C346E] focus:bg-white transition"
                  placeholder="Describe your list..."
                  rows={2}
                  style={{ minHeight: '50px', overflow: 'hidden', resize: 'none' }}
                  onInput={(e) => {
                    e.stopPropagation();
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = '36px';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </div>
              {/* Blank space for tasks */}
              <div className="flex-1" />              {/* Visibility Icon */}
              <div className="absolute top-4 right-4 text-xl">
                {project.visibility === 'public' ? <FaGlobe /> : <FaLock />}
              </div>
              {/* Tag */}
              {project.tag && (
                <span
                  className="absolute bottom-4 left-4 px-3 py-1 rounded-xl text-xs font-bold shadow-lg select-none"
                  style={{ zIndex: 1, backgroundColor: project.tag.color, color: '#222' }}
                >
                  {project.tag.label}
                </span>
              )}
              {/* Trashcan Icon for Delete */}
              <button
                className="absolute bottom-4 right-4 text-2xl text-gray-400 hover:text-red-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(project.id);
                }}
                title="Delete list"
              >
                <FaTrash />
              </button>
              {/* Edit Icon */}
              <button
                className="absolute bottom-4 right-14 text-2xl text-gray-400 hover:text-[#5C346E] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(project);
                }}
                title="Edit list"
              >
                <FaPencilAlt />
              </button>
            </div>
          </FadeContent>
        ))}
        {/* Add New List Button */}
        <FadeContent duration={900} delay={100}>
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-[#5C346E] rounded-2xl min-h-[320px] cursor-pointer hover:bg-[#f7f0ff] transition"
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="text-5xl text-[#5C346E] mb-2" />
          </div>
        </FadeContent>
        {/* Modal for Adding New List */}
        {showModal && (
          <FadeContent duration={900} delay={100}>
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border-2 border-[#5C346E] relative">
                <button
                  className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
                  onClick={() => setShowModal(false)}
                >
                  &times;
                </button>
                <h3 className="text-2xl font-bold mb-6 text-[#5C346E]">Create New List</h3>
                {/* List Name */}
                <label className="block font-semibold mb-1">List Name</label>
                <input
                  type="text"
                  value={newListTitle}
                  onChange={e => setNewListTitle(e.target.value)}
                  className="w-full mb-4 px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E]"
                  placeholder="Enter list name"
                />
                {/* List Description */}
                <label className="block text-[#5C346E] font-bold mb-2 mt-2" htmlFor="list-description">Description</label>
                <textarea
                  id="list-description"
                  value={newListDescription}
                  onChange={e => setNewListDescription(e.target.value)}
                  className="w-full mb-4 px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E] resize-none min-h-[60px]"
                  placeholder="Describe your list..."
                />
                {/* Members Input */}
                <label className="block font-semibold mb-1">Add Members</label>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className="w-full mb-2 px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E]"
                  placeholder="Search members..."
                />
                <div className="max-h-32 overflow-y-auto mb-2">
                  {filteredMembers.length === 0 ? (
                    <div className="text-gray-400 px-2 py-1">No members found</div>
                  ) : (
                    filteredMembers.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center px-2 py-1 hover:bg-[#f7f0ff] cursor-pointer"
                        onClick={() => setNewListMembers([...newListMembers, member.userName])}
                      >
                        {member.userName}
                      </div>
                    ))
                  )}
                </div>
                {/* Selected Members */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {newListMembers.map((memberName) => (
                    <span key={memberName} className="bg-[#f7f0ff] px-3 py-1 rounded-xl text-[#5C346E] flex items-center">
                      {memberName}
                      <button onClick={() => setNewListMembers(newListMembers.filter(mem => mem !== memberName))} className="ml-2 text-lg">&times;</button>
                    </span>
                  ))}
                </div>
                {/* Tag Selector */}
                <label className="block text-[#5C346E] font-bold mb-2 mt-2">Tag</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-xl border-2 font-semibold text-sm transition ${newListTagType==='preset' ? 'bg-[#5C346E] text-white border-[#5C346E]' : 'bg-white text-[#5C346E] border-[#c7b3d6]'}`}
                    onClick={() => setNewListTagType('preset')}
                  >Preset</button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-xl border-2 font-semibold text-sm transition ${newListTagType==='custom' ? 'bg-[#5C346E] text-white border-[#5C346E]' : 'bg-white text-[#5C346E] border-[#c7b3d6]'}`}
                    onClick={() => setNewListTagType('custom')}
                  >Custom</button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-xl border-2 font-semibold text-sm transition ${newListTagType==='' ? 'bg-[#5C346E] text-white border-[#5C346E]' : 'bg-white text-[#5C346E] border-[#c7b3d6]'}`}
                    onClick={() => setNewListTagType('')}
                  >None</button>
                </div>
                {newListTagType === 'preset' && (
                  <select
                    value={newListTagPreset?.label || ''}
                    onChange={e => {
                      const found = PRESET_TAGS.find(t => t.label === e.target.value);
                      setNewListTagPreset(found || null);
                    }}
                    className="w-full mb-4 px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E] bg-white"
                  >
                    <option value="">Select a tag</option>
                    {PRESET_TAGS.map(tag => (
                      <option key={tag.label} value={tag.label}>{tag.label}</option>
                    ))}
                  </select>
                )}
                {newListTagType === 'custom' && (
                  <div className="flex flex-col gap-1 mb-4">
                    <input
                      type="text"
                      value={newListTagCustom.label}
                      onChange={e => setNewListTagCustom({...newListTagCustom, label: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E]"
                      placeholder="Tag name (e.g. Shopping)"
                      maxLength={16}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[#5C346E] font-semibold">Color:</span>
                      <input
                        type="color"
                        value={newListTagCustom.color}
                        onChange={e => setNewListTagCustom({...newListTagCustom, color: e.target.value})}
                        className="w-8 h-8 border-none outline-none bg-transparent cursor-pointer"
                      />
                      <span className="ml-2 text-xs text-gray-500">{newListTagCustom.color}</span>
                    </div>
                  </div>
                )}
                {/* Visibility Selector (styled like members) */}
                <label className="block text-[#5C346E] font-bold mb-2 mt-2">Visibility</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["private", "public"].map(v => (
                    <button
                      key={v}
                      type="button"
                      className={`px-3 py-1 rounded-full border ${newListVisibility === v ? 'bg-[#5C346E] text-white border-[#5C346E]' : 'bg-white text-[#5C346E] border-[#5C346E]'} transition-colors`}
                      style={{ fontWeight: 500, fontSize: '0.95rem' }}
                      onClick={() => setNewListVisibility(v as 'private' | 'public')}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  className="w-full bg-[#5C346E] text-white text-lg font-bold px-6 py-3 rounded-xl shadow hover:bg-[#7d4ea7] transition"
                  onClick={handleAddList}
                >
                  Create List
                </button>
              </div>
            </div>
          </FadeContent>
        )}
        {/* Delete Confirmation Modal */}
        {deleteConfirm !== null && (
          <FadeContent duration={900} delay={100}>
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl border-2 border-[#5C346E] relative">
                <h3 className="text-xl font-bold mb-6 text-[#5C346E]">Delete this list?</h3>
                <p className="mb-6">Are you sure you want to delete this list? This action cannot be undone.</p>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600"
                    onClick={() => handleDeleteList(deleteConfirm)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </FadeContent>
        )}
        {/* Members Modal */}
        {showMembersModal !== null && (
          <FadeContent duration={900} delay={100}>
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl border-2 border-[#5C346E] relative">
                <button
                  className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
                  onClick={() => { setShowMembersModal(null); setMembersSearch(''); }}
                >
                  &times;
                </button>
                <h3 className="text-xl font-bold mb-4 text-[#5C346E]">Project Members</h3>
                <input
                  type="text"
                  value={membersSearch}
                  onChange={(e) => setMembersSearch(e.target.value)}
                  className="w-full mb-4 px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E]"
                  placeholder="Search members..."
                />
                <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
                  <div className="text-gray-400 px-2 py-1">No members available yet</div>
                </div>
              </div>
            </div>
          </FadeContent>
        )}
        {/* Edit Modal */}
        {editListModal !== null && (
          <FadeContent duration={900} delay={100}>
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border-2 border-[#5C346E] relative">
                <button
                  className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
                  onClick={() => setEditListModal(null)}
                >
                  &times;
                </button>
                <h3 className="text-xl font-bold mb-4 text-[#5C346E]">Edit List</h3>
                {/* Tag Selector */}
                <label className="block text-[#5C346E] font-bold mb-2 mt-2">Tag</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-xl border-2 font-semibold text-sm transition ${editTagType==='preset' ? 'bg-[#5C346E] text-white border-[#5C346E]' : 'bg-white text-[#5C346E] border-[#c7b3d6]'}`}
                    onClick={() => setEditTagType('preset')}
                  >Preset</button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-xl border-2 font-semibold text-sm transition ${editTagType==='custom' ? 'bg-[#5C346E] text-white border-[#5C346E]' : 'bg-white text-[#5C346E] border-[#c7b3d6]'}`}
                    onClick={() => setEditTagType('custom')}
                  >Custom</button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-xl border-2 font-semibold text-sm transition ${editTagType==='' ? 'bg-[#5C346E] text-white border-[#5C346E]' : 'bg-white text-[#5C346E] border-[#c7b3d6]'}`}
                    onClick={() => setEditTagType('')}
                  >None</button>
                </div>
                {editTagType === 'preset' && (
                  <select
                    value={editTagPreset?.label || ''}
                    onChange={e => {
                      const found = PRESET_TAGS.find(t => t.label === e.target.value);
                      setEditTagPreset(found || null);
                    }}
                    className="w-full mb-4 px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E] bg-white"
                  >
                    <option value="">Select a tag</option>
                    {PRESET_TAGS.map(tag => (
                      <option key={tag.label} value={tag.label}>{tag.label}</option>
                    ))}
                  </select>
                )}
                {editTagType === 'custom' && (
                  <div className="flex flex-col gap-1 mb-4">
                    <input
                      type="text"
                      value={editTagCustom.label}
                      onChange={e => setEditTagCustom({...editTagCustom, label: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E]"
                      placeholder="Tag name (e.g. Shopping)"
                      maxLength={16}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[#5C346E] font-semibold">Color:</span>
                      <input
                        type="color"
                        value={editTagCustom.color}
                        onChange={e => setEditTagCustom({...editTagCustom, color: e.target.value})}
                        className="w-8 h-8 border-none outline-none bg-transparent cursor-pointer"
                      />
                      <span className="ml-2 text-xs text-gray-500">{editTagCustom.color}</span>
                    </div>
                  </div>
                )}
                {/* Visibility Selector (styled like members) */}
                <label className="block text-[#5C346E] font-bold mb-2 mt-2">Visibility</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["private", "public"].map(v => (
                    <button
                      key={v}
                      type="button"
                      className={`px-3 py-1 rounded-full border ${editListVisibility === v ? 'bg-[#5C346E] text-white border-[#5C346E]' : 'bg-white text-[#5C346E] border-[#5C346E]'} transition-colors`}
                      style={{ fontWeight: 500, fontSize: '0.95rem' }}
                      onClick={() => setEditListVisibility(v as 'private' | 'public')}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
                {/* Members Selector */}
                <label className="block text-[#5C346E] font-bold mb-2 mt-2">Members</label>
                {/* Search input for members */}
                <input
                  className="input mb-1 focus:outline-none focus:border-2 focus:border-[#5C346E] focus:rounded-xl"
                  style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem' }}
                  type="text"
                  placeholder="Search members..."
                  value={editMemberSearch}
                  onChange={(e) => setEditMemberSearch(e.target.value)}
                />
                <div className="flex flex-wrap gap-2 mb-4">
                  {workspaceMembers.filter((member) => member.userName.toLowerCase().includes(editMemberSearch.toLowerCase())).map((member) => (
                    <button
                      key={member.userId}
                      type="button"
                      className={`px-3 py-1 rounded-xl border-2 font-semibold text-sm transition
                        ${editMembers.includes(member.userName) ? 'bg-[#5C346E] text-white border-[#5C346E]' : 'bg-white text-[#5C346E] border-[#c7b3d6]'}`}
                      onClick={() => setEditMembers(editMembers.includes(member.userName) ? editMembers.filter(mem => mem !== member.userName) : [...editMembers, member.userName])}
                    >
                      {member.userName}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300"
                    onClick={() => setEditListModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2 rounded-xl bg-[#5C346E] text-white font-bold hover:bg-purple-700"
                    onClick={handleSaveEdit}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </FadeContent>
        )}
      </div>
    </FadeContent>
  );
};

export default Lists;
