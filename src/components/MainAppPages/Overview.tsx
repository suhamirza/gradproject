import { useState, useEffect, useRef } from 'react';
import { useTitle } from '../../context/TitleContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useUser } from '../../context/UserContext';
import { organizationService, type OrganizationMember } from '../../services/organizationService';
import FadeContent from '../../components/ReactBits/FadeContent';
import AddMemberModal from '../UI/AddMemberModal';
import MembersModal from '../UI/MembersModal';


const statusOptions = ['Active', 'Completed', 'On Hold'];

export default function Overview() {
  const { title, setTitle } = useTitle();
  const { currentWorkspace, updateWorkspace, isLoading, error } = useWorkspace();
  const { user } = useUser();
    // Form state  
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [lead, setLead] = useState('');  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [projectDetails, setProjectDetails] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);const inputRef = useRef<HTMLInputElement | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const projectDetailsRef = useRef<HTMLTextAreaElement | null>(null);  // Sync workspace data with form when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      setTitle(currentWorkspace.name);
      setDescription(currentWorkspace.description ?? '');
      console.log('Syncing workspace data to form:', currentWorkspace);
      console.log('Current user when loading workspace:', user);
      
      // Load members and check if current user is admin
      if (user?.id) {
        loadMembers();
      } else {
        console.warn('User not loaded yet, waiting...');
      }
    }
  }, [currentWorkspace, user, setTitle]);// Load organization members
  const loadMembers = async () => {
    if (!currentWorkspace?.id || !user?.id) return;
    
    setMembersLoading(true);
    try {
      const response = await organizationService.getOrganizationMembers(currentWorkspace.id);
      console.log('Members API response:', response);
      setMembers(response.members);
      
      // Check if current user is admin by finding them in the members list
      const currentUserMember = response.members.find(member => member.userId === user.id);
      const isCurrentUserAdmin = currentUserMember?.role === 'admin';
      
      console.log('Current user ID:', user.id);
      console.log('Current user member:', currentUserMember);
      console.log('Is current user admin:', isCurrentUserAdmin);
      
      setIsAdmin(isCurrentUserAdmin || false);
    } catch (error) {
      console.error('Failed to load members:', error);
      // Set empty array on error to prevent UI issues
      setMembers([]);
      setIsAdmin(false);
    } finally {
      setMembersLoading(false);
    }
  };const handleMemberRemove = async (member: OrganizationMember) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const response = await organizationService.removeMember(currentWorkspace.id, member.userId);
      console.log('Remove member API response:', response);
      // Reload members after successful removal
      loadMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
      // You could add a toast notification here for better UX
      alert('Failed to remove member. Please try again.');
    }
  };

  // Save description changes to database with debouncing
  useEffect(() => {
    if (!currentWorkspace || description === (currentWorkspace.description ?? '')) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        await updateWorkspace({ description });
        console.log('Description saved to database:', description);
      } catch (error) {
        console.error('Failed to save description:', error);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [description, currentWorkspace, updateWorkspace]);

  // Save title changes to database when title context changes
  useEffect(() => {
    if (!currentWorkspace || title === currentWorkspace.name) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        await updateWorkspace({ name: title });
        console.log('Title saved to database:', title);
      } catch (error) {
        console.error('Failed to save title:', error);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [title, currentWorkspace, updateWorkspace]);
  useEffect(() => {
    if (inputRef.current && spanRef.current) {
      inputRef.current.style.width = `${spanRef.current.offsetWidth}px`;
    }
  }, [lead]);

  const handleProjectDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProjectDetails(e.target.value);
    if (projectDetailsRef.current) {
      projectDetailsRef.current.style.height = 'auto';
      projectDetailsRef.current.style.height = projectDetailsRef.current.scrollHeight + 'px';
    }
  };return (
    <div className="flex flex-col items-start relative">
      
      {/* Organization ID Display - Absolute Top Right */}
      <FadeContent>
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600">
            <span className="font-semibold">Workspace ID:</span>
            <span className="ml-2 font-mono text-gray-800 select-all">
              {currentWorkspace?.id || 'Loading...'}
            </span>
          </div>
        </div>
      </FadeContent>
      
      {/* Project Title Display */}
      <FadeContent>
      <h2 className="font-extrabold text-[2.375rem] mb-4 mt-0">
        {title || 'Workspace Overview'}
      </h2>
      </FadeContent>
      {/* Description Input */}
      <FadeContent>
      <input
        type="text"
        value={description}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
        placeholder="Description..."
        className="text-[1.625rem] w-full mb-9 bg-transparent border-none outline-none text-gray-400 placeholder:text-gray-400"
      />
      </FadeContent>
      {/* Status Dropdown */}
      <FadeContent>
      <div className="mb-7 flex items-center">
        <label className="font-bold mr-5 text-[1.375rem]">Status</label>
        <select
          value={status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
          className={
            status === 'Active'
              ? 'px-2 py-2 text-center rounded-xl border-2 font-bold outline-none text-white text-[1.375rem] ml-3 bg-[#43d13a] border-[#43d13a] w-auto min-w-0 cursor-pointer'
            : status === 'On Hold'
              ? 'px-4 py-2 text-center rounded-xl border-2 font-bold outline-none text-white text-[1.375rem] ml-3 bg-[#e74c3c] border-[#e74c3c] w-auto min-w-0 cursor-pointer'
              : 'px-4 py-2 text-center rounded-xl border-2 font-bold outline-none text-white text-[1.375rem] ml-3 bg-gray-400 border-gray-400 w-auto min-w-0 cursor-pointer'
          }
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt} className="text-black bg-white">{opt}</option>
          ))}
        </select>
      </div>
      </FadeContent>      {/* Team Lead Input */}
      <FadeContent>
      <div className="mb-7 flex items-center">
        <label className="font-bold mr-5 text-[1.375rem]">Lead</label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={lead}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLead(e.target.value)}
            placeholder="Team Lead"
            className="border-2 border-gray-300 text-center rounded-xl px-4 py-2 font-semibold outline-none bg-[#fafafa] text-[1.375rem] min-w-[6rem] w-auto transition-all duration-100"
            style={{ width: 'auto' }}
            ref={inputRef}
          />
          <span
            ref={spanRef}
            className="invisible absolute left-0 top-0 whitespace-pre px-6 py-2 font-semibold text-[1.375rem] text-center"
            aria-hidden="true"
          >
            {lead || 'team lead'}
          </span>
        </div>
      </div>
      </FadeContent>{/* Members Section */}
      <FadeContent>
      <div className="mb-7 flex items-center">
        <label className="font-bold mr-5 text-[1.375rem]">Members</label>        <button
          onClick={() => setShowMembersModal(true)}
          className="group relative px-6 py-3 bg-[#5C346E] text-white rounded-2xl font-semibold text-[1.125rem] shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={membersLoading}
        >
          <span>{membersLoading ? 'Loading...' : 'View Members'}</span>
          <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm font-bold">
            {membersLoading ? '...' : members.length}
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-200"></div>
        </button>
      </div>
      </FadeContent>
      
      {/* Divider */}
      <hr className="w-full border-t-1 border-[##9CA3AF] mt-2" />      {/* Project Details Textarea */}
      <FadeContent>
      <textarea
        ref={projectDetailsRef}
        value={projectDetails}
        onChange={handleProjectDetailsChange}
        placeholder="Project Details..."
        className="mt-12 w-full outline-none bg-transparent text-[1.625rem] font-bold p-0 m-0 border-none placeholder:text-gray-400 text-gray-400"
        style={{ minHeight: '3.5rem', resize: 'none' }}
        rows={2}
      />
      </FadeContent>      {/* Add Member Modal */}
      {showAddMemberModal && currentWorkspace && (
        <AddMemberModal
          organizationId={currentWorkspace.id}
          onClose={() => setShowAddMemberModal(false)}
          onSuccess={loadMembers}
        />
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <MembersModal
          members={members}
          isAdmin={isAdmin}
          onClose={() => setShowMembersModal(false)}
          onAddMember={() => {
            setShowMembersModal(false);
            setShowAddMemberModal(true);
          }}
          onRemoveMember={handleMemberRemove}
        />
      )}
    </div>
  );
}