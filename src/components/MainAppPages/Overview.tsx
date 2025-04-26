import React, { useState, useEffect, useRef } from 'react';

const navButtons = [
  { label: 'Overview', key: 'overview' },
  { label: 'Lists', key: 'lists' },
  { label: 'Chats', key: 'chats' },
];

const statusOptions = ['Active', 'Completed', 'On Hold'];

export default function Overview() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [lead, setLead] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState('');
  const [projectDetails, setProjectDetails] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const memberInputRef = useRef<HTMLInputElement>(null);
  const memberSpanRef = useRef<HTMLSpanElement>(null);
  const projectDetailsRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleSpanRef = useRef<HTMLSpanElement>(null);

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

  useEffect(() => {
    if (titleInputRef.current && titleSpanRef.current) {
      const input = titleInputRef.current;
      const span = titleSpanRef.current;
      const computed = window.getComputedStyle(input);
      span.style.font = computed.font;
      span.style.fontWeight = computed.fontWeight;
      span.style.fontSize = computed.fontSize;
      span.style.fontFamily = computed.fontFamily;
      span.style.letterSpacing = computed.letterSpacing;
      span.style.textTransform = computed.textTransform;
      // Set width: span width + left padding - right offset
      input.style.width = (span.offsetWidth + 12) + 'px'; // 12px = 16px left padding - 4px right offset
    }
  }, [title]);

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
  };

  return (
    <div className="flex flex-col items-start">
      {/* Title Input */}
      <div className="inline-block mb-6 align-top">
        <input
          type="text"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Title"
          className="text-[2.75rem] font-extrabold bg-transparent border-none outline-none placeholder:text-gray-400 transition-colors duration-150 hover:bg-[#f7f0ff] rounded-xl box-content pl-4 pr-1"
          ref={titleInputRef}
          style={{ width: 'auto', margin: 0 }}
        />
        <span
          ref={titleSpanRef}
          className="absolute left-[-9999px] top-0 select-none whitespace-pre font-extrabold text-[2.75rem] pl-4 pr-1"
          aria-hidden="true"
        >
          {title || 'Title'}
        </span>
      </div>
      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-12">
        {navButtons.map(btn => (
          <button
            key={btn.key}
            className={`px-9 py-3 rounded-xl border-2 ${btn.key === 'overview' ? 'border-[#8e44ec] bg-[#f7f0ff] text-[#8e44ec] font-extrabold' : 'border-gray-300 bg-white text-gray-900 font-bold'} text-[1.375rem] transition`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      {/* Divider */}
      <hr className="w-full border-t-1 border-[#180620] mb-8" />
      {/* Project Title Display */}
      <h2 className="font-extrabold text-[2.375rem] mb-4 mt-0">{title || 'Title'}</h2>
      {/* Description Input */}
      <input
        type="text"
        value={description}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
        placeholder="Description..."
        className="text-[1.625rem] w-full mb-9 bg-transparent border-none outline-none text-gray-400 placeholder:text-gray-400"
      />
      {/* Status Dropdown */}
      <div className="mb-7 flex items-center">
        <label className="font-bold mr-5 text-[1.375rem]">Status</label>
        <select
          value={status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
          className={
            status === 'Active'
              ? 'px-2 py-2 text-center rounded-xl border-2 font-bold outline-none text-white text-[1.375rem] ml-3 bg-[#43d13a] border-[#43d13a] w-auto min-w-0'
            : status === 'On Hold'
              ? 'px-4 py-2 text-center rounded-xl border-2 font-bold outline-none text-white text-[1.375rem] ml-3 bg-[#e74c3c] border-[#e74c3c] w-auto min-w-0'
              : 'px-4 py-2 text-center rounded-xl border-2 font-bold outline-none text-white text-[1.375rem] ml-3 bg-gray-400 border-gray-400 w-auto min-w-0'
          }
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt} className="text-black bg-white">{opt}</option>
          ))}
        </select>
      </div>
      {/* Team Lead Input */}
      <div className="mb-7 flex items-center">
        <label className="font-bold mr-5 text-[1.375rem]">Lead</label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={lead}
            onChange={(e) => setLead(e.target.value)}
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
      {/* Members Input */}
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
              onChange={e => setMemberInput(e.target.value)}
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
        </div>
      </div>
      {/* Divider */}
      <hr className="w-full border-t-1 border-[##9CA3AF] mt-2" />
      {/* Project Details Textarea */}
      <textarea
        ref={projectDetailsRef}
        value={projectDetails}
        onChange={handleProjectDetailsChange}
        placeholder="Project Details..."
        className="mt-12 w-full outline-none bg-transparent text-[1.625rem] font-bold p-0 m-0 border-none placeholder:text-gray-400 text-gray-400"
        style={{ minHeight: '3.5rem', resize: 'none' }}
        rows={2}
      />
    </div>
  );
}
