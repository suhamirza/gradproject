import React, { useState } from 'react';

const navButtons = [
  { label: 'Overview', key: 'overview' },
  { label: 'Lists', key: 'lists' },
  { label: 'Chats', key: 'chats' },
];

const statusOptions = ['Active', 'Completed'];

export default function Overview() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [lead, setLead] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState('');

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        placeholder="Title"
        style={{
          fontSize: 44,
          fontWeight: 800,
          border: 'none',
          outline: 'none',
          width: '100%',
          marginBottom: 24,
          background: 'transparent',
        }}
      />
      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
        {navButtons.map(btn => (
          <button
            key={btn.key}
            style={{
              padding: '14px 36px',
              borderRadius: 12,
              border: btn.key === 'overview' ? '3px solid #8e44ec' : '2px solid #ccc',
              background: btn.key === 'overview' ? '#f7f0ff' : '#fff',
              color: btn.key === 'overview' ? '#8e44ec' : '#222',
              fontWeight: btn.key === 'overview' ? 800 : 600,
              fontSize: 22,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
      {/* Divider */}
      <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #e4d0f7', margin: '0 0 32px 0' }} />
      {/* Project Title Display */}
      <h2 style={{ fontWeight: 800, fontSize: 38, margin: 0, marginBottom: 16 }}>{title || 'Grad Project'}</h2>
      {/* Description Input */}
      <input
        type="text"
        value={description}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
        placeholder="description..."
        style={{
          fontSize: 26,
          border: 'none',
          outline: 'none',
          width: '100%',
          marginBottom: 36,
          background: 'transparent',
          color: '#888',
        }}
      />
      {/* Status Dropdown */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontWeight: 700, marginRight: 18, fontSize: 22 }}>Status</label>
        <select
          value={status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
          style={{
            padding: '10px 28px',
            borderRadius: 12,
            border: '2px solid #ccc',
            fontWeight: 700,
            background: status === 'Active' ? '#43d13a' : '#ccc',
            color: '#fff',
            outline: 'none',
            marginLeft: 12,
            fontSize: 22,
          }}
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt} style={{ color: '#222' }}>{opt}</option>
          ))}
        </select>
      </div>
      {/* Team Lead Input */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontWeight: 700, marginRight: 18, fontSize: 22 }}>Lead</label>
        <input
          type="text"
          value={lead}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLead(e.target.value)}
          placeholder="team lead"
          style={{
            border: '2px solid #ccc',
            borderRadius: 12,
            padding: '10px 28px',
            fontWeight: 600,
            outline: 'none',
            background: '#fafafa',
            fontSize: 22,
          }}
        />
      </div>
      {/* Members Input */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontWeight: 700, marginRight: 18, fontSize: 22 }}>Members</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {members.map(member => (
            <span key={member} style={{
              display: 'flex',
              alignItems: 'center',
              background: '#eee',
              borderRadius: 20,
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: 20,
              marginBottom: 8,
            }}>
              {member}
              <button
                onClick={() => handleMemberRemove(member)}
                style={{
                  marginLeft: 14,
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: 26,
                }}
                aria-label={`Remove ${member}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={memberInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMemberInput(e.target.value)}
            onKeyDown={handleMemberAdd}
            placeholder="Add member"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              minWidth: 120,
              fontSize: 20,
              marginBottom: 8,
            }}
          />
        </div>
      </div>
      {/* Project Details Placeholder */}
      <div style={{ color: '#aaa', fontWeight: 700, fontSize: 26, marginTop: 48 }}>Project details...</div>
    </div>
  );
}
