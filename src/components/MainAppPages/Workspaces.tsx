import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import FadeContent from '../ReactBits/FadeContent';
import { authService } from '../../services/authService';

interface Workspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
  lastActivity: string;
  members: WorkspaceMember[];
}

interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  avatar?: string;
}

// Mock workspaces data
const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Personal Projects',
    description: 'My personal task management workspace',
    memberCount: 1,
    role: 'owner',
    createdAt: '2024-01-15',
    lastActivity: '2024-06-05',
    members: [
      {
        id: '1',
        name: 'Suha Mirza',
        email: 'suha@example.com',
        role: 'owner',
        joinedAt: '2024-01-15'
      }
    ]
  },
  {
    id: '2',
    name: 'Team Alpha',
    description: 'Collaborative workspace for our development team',
    memberCount: 5,
    role: 'admin',
    createdAt: '2024-02-20',
    lastActivity: '2024-06-04',
    members: [
      {
        id: '1',
        name: 'Suha Mirza',
        email: 'suha@example.com',
        role: 'admin',
        joinedAt: '2024-02-20'
      },
      {
        id: '2',
        name: 'Yahya Ahmed',
        email: 'yahya@example.com',
        role: 'member',
        joinedAt: '2024-02-22'
      },
      {
        id: '3',
        name: 'Muhammad Hassan',
        email: 'muhammad@example.com',
        role: 'member',
        joinedAt: '2024-02-25'
      }
    ]
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    description: 'Managing marketing tasks and campaigns',
    memberCount: 8,
    role: 'member',
    createdAt: '2024-03-10',
    lastActivity: '2024-06-03',
    members: []
  }
];

export default function Workspaces() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>(mockWorkspaces);

  // Utility function for role badge styling
  const getRoleBadgeClass = (role: 'owner' | 'admin' | 'member') => {
    if (role === 'owner') return 'bg-purple-100 text-purple-700';
    if (role === 'admin') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const [showMembersModal, setShowMembersModal] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<Workspace | null>(null);
  
  // Create workspace form state
  const [newWorkspace, setNewWorkspace] = React.useState({
    name: '',
    description: ''
  });
  
  // Join workspace form state
  const [joinCode, setJoinCode] = React.useState('');

  const currentUser = authService.getCurrentUser();
  // Handle create workspace
  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) return;

    const workspace: Workspace = {
      id: Date.now().toString(),
      name: newWorkspace.name,
      description: newWorkspace.description,
      memberCount: 1,
      role: 'owner',
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      members: [        {
          id: currentUser?.id ?? '1',
          name: currentUser?.firstName + ' ' + currentUser?.lastName || 'Current User',
          email: currentUser?.email ?? 'user@example.com',
          role: 'owner',
          joinedAt: new Date().toISOString().split('T')[0]
        }
      ]
    };    try {
      // TODO: Implement API call to create workspace
      console.log('Creating workspace:', workspace);
      setWorkspaces((prev: Workspace[]) => [...prev, workspace]);
      setNewWorkspace({ name: '', description: '' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  // Handle join workspace
  const handleJoinWorkspace = async () => {
    if (!joinCode.trim()) return;

    try {
      // TODO: Implement API call to join workspace
      console.log('Joining workspace with code:', joinCode);
      setJoinCode('');
      setShowJoinModal(false);
      // Refresh workspaces list
    } catch (error) {
      console.error('Failed to join workspace:', error);
    }
  };  // Handle delete workspace
  const handleDeleteWorkspace = async (workspaceId: string) => {
    try {
      // TODO: Implement API call to delete workspace
      console.log('Deleting workspace:', workspaceId);
      setWorkspaces((prev: Workspace[]) => prev.filter(w => w.id !== workspaceId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete workspace:', error);
    }
  };

  // Handle view members
  const handleViewMembers = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setShowMembersModal(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <FadeContent>
      <div className="max-w-5xl mx-auto px-8 py-6 relative">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-[2.75rem] font-extrabold text-[#180620]">
            Workspaces
          </h1>
          <div className="mt-2 text-gray-500">
            Manage your workspaces and collaborate with your team
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-[#5C346E] text-white rounded-lg font-medium hover:bg-[#4A2B5A] transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create New Workspace
          </button>            <button
            onClick={() => setShowJoinModal(true)}
            className="px-6 py-3 bg-white border-2 border-[#5C346E] text-[#5C346E] rounded-lg font-medium hover:bg-[#5C346E] hover:text-white transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            Join Workspace
          </button>
        </div>        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace: Workspace) => (
            <div
              key={workspace.id}
              className="relative bg-white p-6 rounded-2xl border-2 border-[#c7b3d6] shadow-sm hover:border-[#5C346E] hover:shadow-md transition-all duration-200"
            >              {/* Workspace Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-[#5C346E] truncate">
                      {workspace.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {workspace.description}
                  </p>
                </div>                  {/* Role Badge */}
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${(workspace.role === 'owner' || workspace.role === 'admin') ? 'ml-1' : 'ml-2'} ${getRoleBadgeClass(workspace.role)}`}>
                  {workspace.role}
                </span>
              </div>

              {/* Workspace Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <span>{workspace.memberCount} members</span>
                </div>
                <div>
                  Active {formatDate(workspace.lastActivity)}
                </div>
              </div>              {/* Action Buttons */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => handleViewMembers(workspace)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 text-sm"
                >
                  View Members
                </button>
                <button 
                  onClick={() => navigate(`/app/overview?workspace=${workspace.id}`)}
                  className={`${(workspace.role === 'owner' || workspace.role === 'admin') ? 'flex-1' : 'flex-1'} px-4 py-2 bg-[#5C346E] text-white rounded-lg font-medium hover:bg-[#4A2B5A] transition-colors duration-200 text-sm`}
                >
                  Open
                </button>
                {/* Delete Button (only for owners/admins) */}
                {(workspace.role === 'owner' || workspace.role === 'admin') && (
                  <button
                    className="px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setDeleteConfirm(workspace.id);
                    }}
                    title="Delete workspace"
                  >
                    <FaTrash size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create Workspace Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border-2 border-[#5C346E] relative">
              <button
                className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
                onClick={() => setShowCreateModal(false)}
              >
                &times;
              </button>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#5C346E] mb-2">Create New Workspace</h3>
                <p className="text-gray-600">Set up a new workspace for your team</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5C346E] mb-2">
                    Workspace Name *
                  </label>                  <input
                    type="text"
                    value={newWorkspace.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkspace((prev: typeof newWorkspace) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter workspace name"
                    className="w-full px-4 py-3 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200"
                  />
                </div>                <div>
                  <label className="block text-sm font-medium text-[#5C346E] mb-2">
                    Description
                  </label>                  <textarea
                    value={newWorkspace.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewWorkspace((prev: typeof newWorkspace) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your workspace"
                    className="w-full px-4 py-3 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200 h-20 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorkspace}
                  disabled={!newWorkspace.name.trim()}
                  className="flex-1 px-6 py-3 bg-[#5C346E] text-white rounded-lg font-medium hover:bg-[#4A2B5A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Workspace Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border-2 border-[#5C346E] relative">
              <button
                className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
                onClick={() => setShowJoinModal(false)}
              >
                &times;
              </button>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#5C346E] mb-2">Join Workspace</h3>
                <p className="text-gray-600">Enter the workspace invitation code</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5C346E] mb-2">
                    Invitation Code *
                  </label>                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJoinCode(e.target.value)}
                    placeholder="Enter invitation code"
                    className="w-full px-4 py-3 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200"
                  />
                </div>
              </div>              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinWorkspace}
                  disabled={!joinCode.trim()}
                  className="flex-1 px-6 py-3 bg-[#5C346E] text-white rounded-lg font-medium hover:bg-[#4A2B5A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Members Modal */}
        {showMembersModal && selectedWorkspace && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl border-2 border-[#5C346E] relative">
              <button
                className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
                onClick={() => setShowMembersModal(false)}
              >
                &times;
              </button>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#5C346E] mb-2">{selectedWorkspace.name}</h3>
                <p className="text-gray-600">{selectedWorkspace.memberCount} members</p>
              </div>              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedWorkspace.members.map((member: WorkspaceMember) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#5C346E] rounded-full flex items-center justify-center text-white font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[#5C346E]">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="text-right">                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleBadgeClass(member.role)}`}>
                        {member.role}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Joined {formatDate(member.joinedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="px-6 py-3 bg-[#5C346E] text-white rounded-lg font-medium hover:bg-[#4A2B5A] transition-colors duration-200"
                >
                  Close
                </button>
              </div>            </div>
          </div>
        )}        {/* Delete Workspace Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border-2 border-[#5C346E] relative">
              <h3 className="text-xl font-bold mb-6 text-[#5C346E]">Delete this workspace?</h3>
              <p className="mb-6">Are you sure you want to delete this workspace? This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600"
                  onClick={() => handleDeleteWorkspace(deleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FadeContent>
  );
}
