import React, { useState } from 'react';
import { FaLock, FaLockOpen, FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Ensure navigate is imported
import FadeContent from '../../components/ReactBits/FadeContent';

// Mock workspace members for dropdown
const MOCK_MEMBERS = [
  'Suha Mirza',
  'Yahya',
  'Muhammad',
  'Vedat',
  'Aisha',
  'Fatima',
  'Bilal',
  'Zara',
  'Omar',
  'Sara',
  'Keko',
  'Katoosa'
];

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

const defaultList = {
  id: 1,
  title: 'General',
  description: 'describe your list...',
  visibility: 'private', // or 'public'
  members: [...MOCK_MEMBERS], // All dummy members by default
  tag: null as ListTag | null,
};

const Lists: React.FC = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [lists, setLists] = useState([defaultList]);
  const [showModal, setShowModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListMembers, setNewListMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [newListVisibility, setNewListVisibility] = useState<'public' | 'private'>('private');
  const [newListTagType, setNewListTagType] = useState<'preset'|'custom'|''>('');
  const [newListTagPreset, setNewListTagPreset] = useState<ListTag|null>(null);
  const [newListTagCustom, setNewListTagCustom] = useState<{label: string, color: string}>({label: '', color: '#c7b3d6'});
  const [deleteConfirm, setDeleteConfirm] = useState<number|null>(null);
  const [showMembersModal, setShowMembersModal] = useState<number|null>(null);
  const [membersSearch, setMembersSearch] = useState('');
  const [editListModal, setEditListModal] = useState<number|null>(null);
  const [editTagType, setEditTagType] = useState<'preset'|'custom'|''>('');
  const [editTagPreset, setEditTagPreset] = useState<ListTag|null>(null);
  const [editTagCustom, setEditTagCustom] = useState<{label: string, color: string}>({label: '', color: '#c7b3d6'});
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [editListVisibility, setEditListVisibility] = useState<'private' | 'public'>(defaultList.visibility);
  const [editMemberSearch, setEditMemberSearch] = useState('');

  // Filtered members for dropdown
  const filteredMembers = MOCK_MEMBERS.filter(m =>
    m.toLowerCase().includes(memberSearch.toLowerCase()) && !newListMembers.includes(m)
  ).sort();

  const handleAddList = () => {
    if (!newListTitle.trim()) return;
    let tag: ListTag|null = null;
    if (newListTagType === 'preset' && newListTagPreset) tag = newListTagPreset;
    if (newListTagType === 'custom' && newListTagCustom.label) tag = {label: newListTagCustom.label, color: newListTagCustom.color};
    setLists([
      ...lists,
      {
        id: Date.now(),
        title: newListTitle,
        description: newListDescription,
        tag,
        visibility: newListVisibility,
        members: newListMembers,
      },
    ]);
    setShowModal(false);
    setNewListTitle('');
    setNewListDescription('');
    setNewListTagType('');
    setNewListTagPreset(null);
    setNewListTagCustom({label: '', color: '#c7b3d6'});
    setNewListMembers([]);
    setNewListVisibility('private');
  };

  const handleDeleteList = (id: number) => {
    setLists(lists.filter(l => l.id !== id));
    setDeleteConfirm(null);
  };

  const getListById = (id: number) => lists.find(l => l.id === id);

  const openEditModal = (list: any) => {
    setEditListModal(list.id);
    if (!list.tag) {
      setEditTagType('');
      setEditTagPreset(null);
      setEditTagCustom({label: '', color: '#c7b3d6'});
    } else if (list.tag.preset) {
      setEditTagType('preset');
      setEditTagPreset(PRESET_TAGS.find(t => t.label === list.tag.label) || null);
      setEditTagCustom({label: '', color: '#c7b3d6'});
    } else {
      setEditTagType('custom');
      setEditTagPreset(null);
      setEditTagCustom({label: list.tag.label, color: list.tag.color});
    }
    setEditMembers(list.members);
    setEditListVisibility(list.visibility);
    setEditMemberSearch('');
  };

  const handleSaveEdit = () => {
    let tag: ListTag|null = null;
    if (editTagType === 'preset' && editTagPreset) tag = editTagPreset;
    if (editTagType === 'custom' && editTagCustom.label) tag = {label: editTagCustom.label, color: editTagCustom.color};
    setLists(lists.map(l => l.id === editListModal ? { ...l, tag, members: editMembers, visibility: editListVisibility } : l));
    setEditListModal(null);
  };

  return (
    <FadeContent duration={900} delay={100}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-6 w-full">
        {/* List Previews */}
        {lists.map((list) => (
          <FadeContent key={list.id} duration={900} delay={100}>
            <div
              className="relative bg-white border-2 border-[#5C346E] rounded-2xl p-6 min-h-[320px] flex flex-col justify-between shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/app/lists/${encodeURIComponent(list.title)}`)} // Use list.title and encode it
            >
              {/* Title (editable) */}
              <input
                type="text"
                value={list.title}
                onClick={e => e.stopPropagation()}
                onChange={e => {
                  e.stopPropagation();
                  setLists(lists.map(l => l.id === list.id ? { ...l, title: e.target.value } : l));
                }}
                className="font-extrabold text-3xl mb-4 bg-transparent outline-none border-none w-full"
                placeholder="Title.."
              />
              {/* Members Placeholder */}
              <div className="flex flex-row gap-2 mb-4 min-h-[44px]">
                {list.members.slice(0, 5).map((member, idx) => (
                  <div
                    key={member}
                    className="w-11 h-11 rounded-full bg-[#e9e0f3] flex items-center justify-center font-bold text-[#5C346E] text-lg border-2 border-white shadow"
                    title={member}
                    style={{ zIndex: 10 - idx, marginLeft: idx === 0 ? 0 : -25 }}
                  >
                    {member.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                ))}
                {list.members.length > 5 && (
                  <button
                    className="flex items-center px-2 h-11 ml-[-25px] bg-transparent relative z-0 hover:bg-[#f7f0ff] rounded-full border-none outline-none transition"
                    style={{ border: 'none' }}
                    title="Show all members"
                    onClick={e => {
                      e.stopPropagation();
                      setShowMembersModal(list.id);
                    }}
                  >
                    <span className="text-xl text-[#5C346E] ml-2" style={{letterSpacing: '2px'}}>...</span>
                    <span className="text-xl text-[#5C346E] font-bold">+</span>
                  </button>
                )}
              </div>
              {/* Description (editable) */}
              <div className="mb-3">
                <textarea
                  value={list.description || ''}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    e.stopPropagation();
                    const updatedLists = lists.map(l => l.id === list.id ? { ...l, description: e.target.value } : l);
                    setLists(updatedLists);
                  }}
                  className="w-full mt-2 px-2 py-1 rounded-lg border border-[#e9e0f3] bg-[#faf7fd] text-[#5C346E] font-normal text-sm resize-none focus:border-[#5C346E] focus:bg-white transition"
                  placeholder="Describe your list..."
                  rows={2}
                  style={{ minHeight: '50px', overflow: 'hidden', resize: 'none' }}
                  onInput={e => {
                    e.stopPropagation();
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = '36px';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </div>
              {/* Blank space for tasks */}
              <div className="flex-1" />
              {/* Visibility Icon */}
              <div className="absolute top-4 right-4 text-xl">
                {list.visibility === 'private' ? <FaLock /> : <FaLockOpen />}
              </div>
              {/* Tag */}
              {list.tag && (
                <span
                  className="absolute bottom-4 left-4 px-3 py-1 rounded-xl text-xs font-bold shadow-lg select-none"
                  style={{ zIndex: 1, backgroundColor: list.tag.color, color: '#222' }}
                >
                  {list.tag.label}
                </span>
              )}
              {/* Trashcan Icon for Delete */}
              <button
                className="absolute bottom-4 right-4 text-2xl text-gray-400 hover:text-red-500 transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  setDeleteConfirm(list.id);
                }}
                title="Delete list"
              >
                <FaTrash />
              </button>
              {/* Edit Icon */}
              <button
                className="absolute bottom-4 right-14 text-2xl text-gray-400 hover:text-[#5C346E] transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  openEditModal(list);
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
                    filteredMembers.map(m => (
                      <div
                        key={m}
                        className="flex items-center px-2 py-1 hover:bg-[#f7f0ff] cursor-pointer"
                        onClick={() => setNewListMembers([...newListMembers, m])}
                      >
                        {m}
                      </div>
                    ))
                  )}
                </div>
                {/* Selected Members */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {newListMembers.map(m => (
                    <span key={m} className="bg-[#f7f0ff] px-3 py-1 rounded-xl text-[#5C346E] flex items-center">
                      {m}
                      <button onClick={() => setNewListMembers(newListMembers.filter(mem => mem !== m))} className="ml-2 text-lg">&times;</button>
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
                <h3 className="text-xl font-bold mb-4 text-[#5C346E]">List Members</h3>
                <input
                  type="text"
                  value={membersSearch}
                  onChange={e => setMembersSearch(e.target.value)}
                  className="w-full mb-4 px-4 py-2 border-2 border-[#c7b3d6] rounded-xl outline-none focus:border-[#5C346E]"
                  placeholder="Search members..."
                />
                <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
                  {getListById(showMembersModal)?.members.filter(m => m.toLowerCase().includes(membersSearch.toLowerCase())).length === 0 ? (
                    <div className="text-gray-400 px-2 py-1">No members found</div>
                  ) : (
                    getListById(showMembersModal)?.members.filter(m => m.toLowerCase().includes(membersSearch.toLowerCase())).map(m => (
                      <div key={m} className="flex items-center gap-3 px-2 py-2 bg-[#f7f0ff] rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-[#e9e0f3] flex items-center justify-center font-bold text-[#5C346E] text-base border-2 border-white shadow">
                          {m.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#5C346E]">{m}</span>
                      </div>
                    ))
                  )}
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
                  onChange={e => setEditMemberSearch(e.target.value)}
                />
                <div className="flex flex-wrap gap-2 mb-4">
                  {MOCK_MEMBERS.filter(m => m.toLowerCase().includes(editMemberSearch.toLowerCase())).map(m => (
                    <button
                      key={m}
                      type="button"
                      className={`px-3 py-1 rounded-xl border-2 font-semibold text-sm transition
                        ${editMembers.includes(m) ? 'bg-[#5C346E] text-white border-[#5C346E]' : 'bg-white text-[#5C346E] border-[#c7b3d6]'}`}
                      onClick={() => setEditMembers(editMembers.includes(m) ? editMembers.filter(mem => mem !== m) : [...editMembers, m])}
                    >
                      {m}
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
