import React, { useState, useEffect, useRef } from 'react';
import { useTitle } from '../../context/TitleContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import FadeContent from '../../components/ReactBits/FadeContent';


const statusOptions = ['Active', 'Completed', 'On Hold'];

export default function Overview() {
  const { title, setTitle } = useTitle();
  const { currentWorkspace, updateWorkspace, isLoading, error } = useWorkspace();
  
  // Form state  
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [lead, setLead] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const memberInputRef = useRef<HTMLInputElement | null>(null);
  const memberSpanRef = useRef<HTMLSpanElement | null>(null);
  const projectDetailsRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync workspace data with form when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      setTitle(currentWorkspace.name);
      setDescription(currentWorkspace.description ?? '');
      console.log('Syncing workspace data to form:', currentWorkspace);
    }
  }, [currentWorkspace, setTitle]);

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

  useEffect(() => {
    if (memberInputRef.current && memberSpanRef.current) {
      memberInputRef.current.style.width = `${memberSpanRef.current.offsetWidth}px`;
    }
  }, [memberInput]);

  const handleMemberAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && memberInput.trim()) {
      if (!members.includes(memberInput.trim())) {
        setMembers([...members, memberInput.trim()]);
      }
      setMemberInput('');
    }
  };

  const handleMemberRemove = (member: string) => {
    setMembers(members.filter(m => m !== member));
  };

  const handleProjectDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProjectDetails(e.target.value);
    if (projectDetailsRef.current) {
      projectDetailsRef.current.style.height = 'auto';
      projectDetailsRef.current.style.height = projectDetailsRef.current.scrollHeight + 'px';
    }
  };  return (
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
      </FadeContent>
      {/* Team Lead Input */}
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
      </FadeContent>
      {/* Members Input */}
      <FadeContent>
      <div className="mb-7 flex items-center w-full gap-4">
        <label className="font-bold mr-5 text-[1.375rem] whitespace-nowrap">Members</label>
        <div className="flex flex-wrap gap-4 items-center flex-1 min-w-0">
          {members.map(member => (
            <span key={member} className="flex items-center bg-gray-200 rounded-2xl px-5 py-2 font-semibold text-[1.25rem] mb-2">
              {member}
              <button
                type="button"
                onClick={() => handleMemberRemove(member)}
                className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
              >
                &times;
              </button>
            </span>
          ))}
          <div className="relative flex items-center">
            <input
              type="text"
              value={memberInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMemberInput(e.target.value)}
              onKeyDown={handleMemberAdd}
              placeholder="Add Member"
              className="border-2 border-gray-300 rounded-xl px-4 py-2 font-semibold outline-none bg-[#fafafa] text-[1.25rem] min-w-[11rem] w-auto transition-all duration-100 flex-shrink-0 text-center"
              ref={memberInputRef}
              style={{ width: 'auto' }}
            />
            <span
              ref={memberSpanRef}
              className="invisible absolute left-0 top-0 whitespace-pre px-4 py-2 font-semibold text-[1.25rem] min-w-[11rem] text-center"
              aria-hidden="true"
            >
              {memberInput || 'Add member'}
            </span>
          </div>
        </div>      </div>
      </FadeContent>
      
      {/* Divider */}
      <hr className="w-full border-t-1 border-[##9CA3AF] mt-2" />{/* Project Details Textarea */}
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
      </FadeContent>
    </div>
  );
}