import React from 'react';
import mainpagepic from '../../assets/mainpagepic.png';
import { useNavigate } from 'react-router-dom';
import SplitText from '../ReactBits/SplitText';
import FadeContent from '../ReactBits/FadeContent';
import { organizationService, type CreateOrganizationRequest } from '../../services/organizationService';

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  // Modal state
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Create workspace form state
  const [newWorkspace, setNewWorkspace] = React.useState({
    name: '',
    description: ''
  });
  
  // Join workspace form state
  const [joinCode, setJoinCode] = React.useState('');

  // Handle create workspace (organization)
  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const organizationData: CreateOrganizationRequest = {
        name: newWorkspace.name.trim(),
        description: newWorkspace.description.trim() !== '' ? newWorkspace.description.trim() : undefined
      };

      console.log('Sending organization data:', organizationData);
      console.log('Form state before sending:', newWorkspace);
      
      const response = await organizationService.createOrganization(organizationData);
      
      console.log('Organization created successfully:', response);
      
      // Reset form and close modal
      setNewWorkspace({ name: '', description: '' });
      setShowCreateModal(false);
      
      // Navigate to the new organization in overview
      navigate(`/app/overview?workspace=${response.organization.id}`);
      
    } catch (error: any) {
      console.error('Failed to create organization:', error);
      setError(error.message ?? 'Failed to create workspace. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle join workspace
  const handleJoinWorkspace = async () => {
    if (!joinCode.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement join workspace logic
      // For now, we'll just simulate joining and navigate to overview
      console.log('Joining workspace with code:', joinCode);
      setJoinCode('');
      setShowJoinModal(false);
      navigate('/app/overview');
    } catch (error: any) {
      console.error('Failed to join workspace:', error);
      setError(error.message ?? 'Failed to join workspace. Please check the invitation code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <div className="flex flex-wrap justify-center items-baseline mb-6">
        <SplitText
          text="Welcome to"
          className="text-4xl md:text-6xl font-bold text-center leading-[1.2] mr-2"
          animationFrom={{ opacity: 0, transform: 'translate3d(0,20px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          delay={20}
          textAlign="center"
        />
        <SplitText
          text="Taskify!"
          className="text-4xl md:text-6xl font-bold text-center leading-[1.2] text-[#5C346E] align-baseline"
          animationFrom={{ opacity: 0, transform: 'translate3d(0,20px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          delay={120}
          textAlign="center"
        />
      </div>
      <SplitText
        text="please choose an option to get started"
        className="text-lg md:text-2xl text-center mb-6 text-black/80 font-bold"
        animationFrom={{ opacity: 0, transform: 'translate3d(0,40px,0)' }}
        animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
        delay={20}
        textAlign="center"
      />
      <FadeContent duration={900} delay={100}>
        <img src={mainpagepic} alt="Team working" className="w-60 md:w-80 mb-8" />
      </FadeContent>
      <div className="flex gap-8">
        <FadeContent duration={900} delay={100}>
          <button
            className="bg-[#180620] text-white text-lg font-bold px-8 py-4 rounded-xl shadow transition hover:bg-[#2a0a3c] focus:outline-none transition delay-150 duration-300 ease-in-out hover:-translate-y-1"
            style={{ border: 'none' }}
            onClick={() => setShowJoinModal(true)}
          >
            join an existing workplace
          </button>
        </FadeContent>
        <FadeContent duration={900} delay={200}>
          <button
            className="bg-white text-[#180620] text-lg font-bold px-8 py-4 rounded-xl shadow border-2 border-[#180620] transition hover:bg-[#f4f0f8] focus:outline-none transition delay-150 duration-300 ease-in-out hover:-translate-y-1"
            onClick={() => setShowCreateModal(true)}
          >
            Create a new workplace
          </button>
        </FadeContent>
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
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5C346E] mb-2">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  value={newWorkspace.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkspace((prev: typeof newWorkspace) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter workspace name"
                  className="w-full px-4 py-3 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C346E] mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkspace.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewWorkspace((prev: typeof newWorkspace) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your workspace"
                  className="w-full px-4 py-3 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200 h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError(null);
                  setNewWorkspace({ name: '', description: '' });
                }}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkspace}
                disabled={!newWorkspace.name.trim() || isLoading}
                className="flex-1 px-6 py-3 bg-[#5C346E] text-white rounded-lg font-medium hover:bg-[#4A2B5A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create'}
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
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5C346E] mb-2">
                  Invitation Code *
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJoinCode(e.target.value)}
                  placeholder="Enter invitation code"
                  className="w-full px-4 py-3 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setError(null);
                  setJoinCode('');
                }}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinWorkspace}
                disabled={!joinCode.trim() || isLoading}
                className="flex-1 px-6 py-3 bg-[#5C346E] text-white rounded-lg font-medium hover:bg-[#4A2B5A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;