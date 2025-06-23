import React, { useState, useRef, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import FadeContent from "../ReactBits/FadeContent";

// Types for chat and message - Backend Compatible
interface Message {
  _id?: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: string;
  status: string;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
}

interface ChannelMember {
  _id?: string;
  channelId: string;
  userId: string;
  userName: string;
  isActive: boolean;
  joinedAt: string;
}

interface Chat {
  _id: string;
  organizationId: string;
  name: string;
  type: 'private' | 'public';
  ownerId: string;
  ownerName: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  // Frontend calculated fields
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  messages?: Message[];
  members?: ChannelMember[];
}

// Dummy data for demonstration - Backend Compatible
const dummyChats: Chat[] = [
  {
    _id: "675a1b2c3d4e5f6789012345",
    organizationId: "org_123456789",
    name: "General",
    type: "public",
    ownerId: "user_suha123",
    ownerName: "Suha",
    isArchived: false,
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2024-12-20T20:13:00Z",
    lastMessage: "Hey guys, I think that we should...",
    lastMessageTime: "8:13 pm",
    unreadCount: 2,
    messages: [
      {
        _id: "msg_001",
        channelId: "675a1b2c3d4e5f6789012345",
        senderId: "user_yahya123",
        senderName: "Yahya",
        content: "hey suha, i was thinking lets start the frontend work today? we could get a proper headstart and we have a bunch of exams coming up too. if we start now it'll be easier on us",
        type: "text",
        status: "delivered",
        isDeleted: false,
        isEdited: false,
        createdAt: "2024-12-20T20:13:00Z",
        updatedAt: "2024-12-20T20:13:00Z"
      },
      {
        _id: "msg_002",
        channelId: "675a1b2c3d4e5f6789012345",
        senderId: "user_current",
        senderName: "You",
        content: "Yeah i was thinking the same. shall i begin the design on figma rn then? i can start up the file and send you the link",
        type: "text",
        status: "delivered",
        isDeleted: false,
        isEdited: false,
        createdAt: "2024-12-20T20:14:00Z",
        updatedAt: "2024-12-20T20:14:00Z"
      },
      {
        _id: "msg_003",
        channelId: "675a1b2c3d4e5f6789012345",
        senderId: "user_suha123",
        senderName: "Suha",
        content: "yes do it, i'll check and add some screens too",
        type: "text",
        status: "delivered",
        isDeleted: false,
        isEdited: false,
        createdAt: "2024-12-20T20:15:00Z",
        updatedAt: "2024-12-20T20:15:00Z"
      },
      {
        _id: "msg_004",
        channelId: "675a1b2c3d4e5f6789012345",
        senderId: "user_current",
        senderName: "You",
        content: "Oh yes you're right it would be best to do that tbh. alright lets do it on my ipad then, ill share screen on it",
        type: "text",
        status: "delivered",
        isDeleted: false,
        isEdited: false,
        createdAt: "2024-12-20T20:16:00Z",
        updatedAt: "2024-12-20T20:16:00Z"
      },
      {
        _id: "msg_005",
        channelId: "675a1b2c3d4e5f6789012345",
        senderId: "user_yahya123",
        senderName: "Yahya",
        content: "Sure, why dont you give me a couple of minutes and we can begin? i just have some things to take care of first.",
        type: "text",
        status: "delivered",
        isDeleted: false,
        isEdited: false,
        createdAt: "2024-12-20T20:17:00Z",
        updatedAt: "2024-12-20T20:17:00Z"
      }
    ],
    members: [
      {
        _id: "member_001",
        channelId: "675a1b2c3d4e5f6789012345",
        userId: "user_yahya123",
        userName: "Yahya",
        isActive: true,
        joinedAt: "2024-12-20T10:00:00Z"
      },
      {
        _id: "member_002",
        channelId: "675a1b2c3d4e5f6789012345",
        userId: "user_suha123",
        userName: "Suha",
        isActive: true,
        joinedAt: "2024-12-20T10:00:00Z"
      },
      {
        _id: "member_003",
        channelId: "675a1b2c3d4e5f6789012345",
        userId: "user_aisha123",
        userName: "Aisha",
        isActive: true,
        joinedAt: "2024-12-20T10:00:00Z"
      },
      {
        _id: "member_004",
        channelId: "675a1b2c3d4e5f6789012345",
        userId: "user_current",
        userName: "You",
        isActive: true,
        joinedAt: "2024-12-20T10:00:00Z"
      }
    ]
  },
  {
    _id: "675a1b2c3d4e5f6789012346",
    organizationId: "org_123456789",
    name: "Frontend",
    type: "public",
    ownerId: "user_yahya123",
    ownerName: "Yahya",
    isArchived: false,
    createdAt: "2024-12-20T09:00:00Z",
    updatedAt: "2024-12-20T17:45:00Z",
    lastMessage: "So far the frontend, we are using Re...",
    lastMessageTime: "5:45 pm",
    unreadCount: 5,
    messages: [],
    members: [
      {
        _id: "member_005",
        channelId: "675a1b2c3d4e5f6789012346",
        userId: "user_yahya123",
        userName: "Yahya",
        isActive: true,
        joinedAt: "2024-12-20T09:00:00Z"
      },
      {
        _id: "member_006",
        channelId: "675a1b2c3d4e5f6789012346",
        userId: "user_current",
        userName: "You",
        isActive: true,
        joinedAt: "2024-12-20T09:00:00Z"
      }
    ]
  },
  {
    _id: "675a1b2c3d4e5f6789012347",
    organizationId: "org_123456789",
    name: "Yahya",
    type: "private",
    ownerId: "user_yahya123",
    ownerName: "Yahya",
    isArchived: false,
    createdAt: "2024-12-20T08:00:00Z",
    updatedAt: "2024-12-20T17:45:00Z",
    lastMessage: "Sure, why dont you give me a co...",
    lastMessageTime: "5:45 pm",
    unreadCount: 0,
    messages: [
      {
        _id: "msg_006",
        channelId: "675a1b2c3d4e5f6789012347",
        senderId: "user_yahya123",
        senderName: "Yahya",
        content: "Sure, why dont you give me a couple of minutes and we can begin? i just have some things to take care of first.",
        type: "text",
        status: "delivered",
        isDeleted: false,
        isEdited: false,
        createdAt: "2024-12-20T17:45:00Z",
        updatedAt: "2024-12-20T17:45:00Z"
      }
    ],
    members: [
      {
        _id: "member_007",
        channelId: "675a1b2c3d4e5f6789012347",
        userId: "user_yahya123",
        userName: "Yahya",
        isActive: true,
        joinedAt: "2024-12-20T08:00:00Z"
      },
      {
        _id: "member_008",
        channelId: "675a1b2c3d4e5f6789012347",
        userId: "user_current",
        userName: "You",
        isActive: true,
        joinedAt: "2024-12-20T08:00:00Z"
      }
    ]
  }
];

// Current user constant for consistency
const CURRENT_USER = {
  id: "user_current",
  name: "You"
};

// Workplace members for autocomplete
const WORKPLACE_MEMBERS = [
  "Yahya", "Suha", "Muhammad", "Vedat", "Aisha", "Fatima", "Bilal", "Zara", "Omar", "Sara", "Keko", "Katoosa", "You"
];

const Chats: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat>(dummyChats[2]); // Default to "Yahya" chat
  const [search, setSearch] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [addMemberInput, setAddMemberInput] = useState("");
  const [addMemberSuggestion, setAddMemberSuggestion] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [newChatMembers, setNewChatMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState("");
  const [memberSuggestion, setMemberSuggestion] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>(dummyChats);
  const [chatType, setChatType] = useState<'public' | 'private'>('public');

  // Helper functions to work with backend-compatible data
  const getChatMembers = (chat: Chat): string[] => {
    return chat.members?.map(member => member.userName) || [];
  };

  const isCurrentUserOwner = (chat: Chat): boolean => {
    return chat.ownerId === CURRENT_USER.id;
  };

  const isCurrentUserAdmin = (chat: Chat): boolean => {
    // In backend, we'll need to track admin status differently
    // For now, owner is considered admin
    return chat.ownerId === CURRENT_USER.id;
  };

  const handleAddMember = () => {
    const trimmed = memberInput.trim();
    if (
      trimmed &&
      WORKPLACE_MEMBERS.includes(trimmed) &&
      !newChatMembers.includes(trimmed)
    ) {
      setNewChatMembers([...newChatMembers, trimmed]);
      setMemberInput("");
      setMemberSuggestion(null);
    }
  };

  const handleCreateChat = () => {
    if (chatType === 'public') {
      if (!newChatName.trim() || newChatMembers.length === 0) return;
      
      const newChatId = `chat_${Date.now()}`;
      const newChat: Chat = {
        _id: newChatId,
        organizationId: "org_123456789", // This would come from context
        name: newChatName,
        type: "public",
        ownerId: CURRENT_USER.id,
        ownerName: CURRENT_USER.name,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: "",
        lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 0,
        messages: [],
        members: [
          {
            _id: `member_${Date.now()}`,
            channelId: newChatId,
            userId: CURRENT_USER.id,
            userName: CURRENT_USER.name,
            isActive: true,
            joinedAt: new Date().toISOString()
          },
          ...newChatMembers.filter(m => m !== CURRENT_USER.name).map((memberName, index) => ({
            _id: `member_${Date.now()}_${index}`,
            channelId: newChatId,
            userId: `user_${memberName.toLowerCase()}`,
            userName: memberName,
            isActive: true,
            joinedAt: new Date().toISOString()
          }))
        ]
      };
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
    } else if (chatType === 'private') {
      if (newChatMembers.length !== 1) return;
      
      const memberName = newChatMembers[0];
      const newChatId = `chat_${Date.now()}`;
      const newChat: Chat = {
        _id: newChatId,
        organizationId: "org_123456789",
        name: memberName,
        type: "private",
        ownerId: CURRENT_USER.id,
        ownerName: CURRENT_USER.name,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: "",
        lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 0,
        messages: [],
        members: [
          {
            _id: `member_${Date.now()}`,
            channelId: newChatId,
            userId: CURRENT_USER.id,
            userName: CURRENT_USER.name,
            isActive: true,
            joinedAt: new Date().toISOString()
          },
          {
            _id: `member_${Date.now()}_1`,
            channelId: newChatId,
            userId: `user_${memberName.toLowerCase()}`,
            userName: memberName,
            isActive: true,
            joinedAt: new Date().toISOString()
          }
        ]
      };
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
    }
    setShowCreateModal(false);
    setNewChatName("");
    setNewChatMembers([]);
    setMemberInput("");
  };

  const addFilteredSuggestions = WORKPLACE_MEMBERS.filter(
    (m: string) =>
      m.toLowerCase().includes(addMemberInput.toLowerCase()) &&
      !getChatMembers(selectedChat).includes(m)
  );

  const handleAddMemberToGroup = () => {
    const trimmed = addMemberInput.trim();
    if (
      trimmed &&
      WORKPLACE_MEMBERS.includes(trimmed) &&
      !getChatMembers(selectedChat).includes(trimmed)
    ) {
      const newMember: ChannelMember = {
        _id: `member_${Date.now()}`,
        channelId: selectedChat._id,
        userId: `user_${trimmed.toLowerCase()}`,
        userName: trimmed,
        isActive: true,
        joinedAt: new Date().toISOString()
      };

      setChats((chats) => chats.map((chat) =>
        chat._id === selectedChat._id
          ? { ...chat, members: [...(chat.members || []), newMember] }
          : chat
      ));
      setSelectedChat((chat) => ({ ...chat, members: [...(chat.members || []), newMember] }));
      setAddMemberInput("");
      setAddMemberSuggestion(null);
    }
  };

  const handleRemoveMember = (memberName: string) => {
    setChats(chats =>
      chats.map(chat =>
        chat._id === selectedChat._id
          ? { ...chat, members: chat.members?.filter(m => m.userName !== memberName) }
          : chat
      )
    );
    setSelectedChat(chat => ({
      ...chat,
      members: chat.members?.filter(m => m.userName !== memberName),
    }));
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSuggestions = WORKPLACE_MEMBERS.filter(
    m =>
      m.toLowerCase().includes(memberInput.toLowerCase()) &&
      !newChatMembers.includes(m)
  );

  const handleSelectSuggestion = (suggestion: string) => {
    setMemberInput(suggestion);
    setMemberSuggestion(suggestion);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleChatClick = (chat: Chat) => {
    setChats((prevChats) =>
      prevChats.map((c) =>
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      )
    );
    setSelectedChat(chat);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat.messages]);

  return (
    <div className="flex h-full min-h-0" style={{height: '100%'}}>
      {/* Sidebar Chat List */}
      <FadeContent className="w-1/3 min-w-[250px] border-r border-gray-300 bg-white flex flex-col h-full min-h-0" delay={100}>
        {/* Header with Chats title and plus button */}
        <div className="flex items-center justify-between px-6 py-6 pb-4">
          <h2 className="text-2xl font-bold">Chats</h2>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white shadow transition"
            title="New Chat"
            onClick={() => setShowCreateModal(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="relative mx-6 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring w-full"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <FadeContent key={chat._id} delay={150} duration={800}>
              <div
                className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${selectedChat._id === chat._id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                onClick={() => handleChatClick(chat)}
              >
                <div className="bg-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-md font-bold text-white mr-4">
                  {chat.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{chat.name}</div>
                  <div className="text-xs text-gray-500 truncate">{chat.lastMessage}</div>
                </div>
                <div className="flex flex-col items-end ml-4 min-w-[48px]">
                  <span className="text-xs text-gray-400 mb-1">{chat.lastMessageTime}</span>
                  {(chat.unreadCount || 0) > 0 && (
                    <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow mt-0.5">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </FadeContent>
          ))}
        </div>
        
        {/* Create Chat Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl p-8 min-w-[340px] relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowCreateModal(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Create New Chat</h2>
              {/* Chat Type Selector */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Chat Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg font-semibold ${chatType === 'public' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setChatType('public')}
                  >
                    Group
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg font-semibold ${chatType === 'private' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setChatType('private')}
                  >
                    Private
                  </button>
                </div>
              </div>
              {/* Group Chat Name Input */}
              {chatType === 'public' && (
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">Chat Name</label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                    placeholder="Enter chat name..."
                    value={newChatName}
                    onChange={e => setNewChatName(e.target.value)}
                  />
                </div>
              )}
              {/* Members Input */}
              <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">Members</label>
                <div className="flex gap-2 mb-2 relative">
                  <input
                    type="text"
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                    placeholder="Add member name..."
                    value={memberInput}
                    onChange={(e) => {
                      setMemberInput(e.target.value);
                      setMemberSuggestion(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMember();
                      } else if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
                        setMemberSuggestion(filteredSuggestions[0]);
                      }
                    }}
                    autoComplete="off"
                    disabled={chatType === 'private' && newChatMembers.length === 1}
                  />
                  {/* Suggestions dropdown */}
                  {memberInput && filteredSuggestions.length > 0 && (
                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded shadow z-10">
                      {filteredSuggestions.map((suggestion) => (
                        <div
                          key={suggestion}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-100 ${
                            memberSuggestion === suggestion ? 'bg-purple-100' : ''
                          }`}
                          onMouseDown={() => handleSelectSuggestion(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    className="px-3 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 text-sm font-semibold"
                    onClick={handleAddMember}
                    disabled={
                      !WORKPLACE_MEMBERS.includes(memberInput.trim()) ||
                      newChatMembers.includes(memberInput.trim()) ||
                      (chatType === 'private' && newChatMembers.length === 1)
                    }
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newChatMembers.map((member) => (
                    <span
                      key={member}
                      className="bg-gray-200 rounded-2xl px-4 py-1 text-sm font-medium flex items-center gap-1"
                    >
                      {member}
                      <button
                        type="button"
                        className="ml-1 text-gray-400 hover:text-gray-700"
                        onClick={() =>
                          setNewChatMembers(newChatMembers.filter((m) => m !== member))
                        }
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                  onClick={() => setShowCreateModal(false)}
                >Cancel</button>
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                  onClick={handleCreateChat}
                  disabled={(chatType === 'public' && (!newChatName.trim() || newChatMembers.length === 0)) || (chatType === 'private' && newChatMembers.length !== 1)}
                >Create</button>
              </div>
            </div>
          </div>
        )}
      </FadeContent>

      {/* Chat Window */}
      <FadeContent className="flex-1 flex flex-col bg-[#fcfbff] h-full min-h-0 relative" delay={200}>
        <div
          className="flex items-center p-6 border-b border-gray-200 cursor-pointer select-none"
          onClick={() => setShowMembersModal(true)}
        >
          <div className="bg-purple-400 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold text-white mr-4">
            {selectedChat.name[0]}
          </div>
          <div>
            <div className="text-2xl font-bold">{selectedChat.name}</div>
            {/* Group members inline display */}
            {getChatMembers(selectedChat).length > 2 && (
              <div className="text-xs text-gray-500 mt-1">
                {getChatMembers(selectedChat).slice(0, 5).join(", ")}
                {getChatMembers(selectedChat).length > 5 && (
                  <>
                    {", "}
                    <span
                      className="underline cursor-pointer hover:text-purple-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMembersModal(true);
                      }}
                    >
                      and {getChatMembers(selectedChat).length - 5} more
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Members Modal */}
        {showMembersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl p-8 min-w-[340px] relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
                onClick={() => setShowMembersModal(false)}
              >
                &times;
              </button>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Group Members</h2>
                {/* Add member button in modal */}
                {isCurrentUserOwner(selectedChat) && (
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold shadow ml-2"
                    title="Add member"
                    onClick={() => setShowAddMembersModal(true)}
                  >
                    +
                  </button>
                )}
              </div>
              {/* Owner at top */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-purple-700">{selectedChat.ownerName}</span>
                <span className="bg-yellow-300 text-yellow-900 rounded px-2 py-0.5 text-xs font-semibold">Owner</span>
              </div>
              {/* Other members */}
              <div className="flex flex-col gap-1">
                {selectedChat.members?.filter((m) => m.userId !== selectedChat.ownerId).map((member) => (
                  <div key={member._id} className="flex items-center gap-2">
                    <span>{member.userName}</span>
                    {/* Only owner can remove members, can't remove yourself */}
                    {isCurrentUserOwner(selectedChat) &&
                      member.userId !== CURRENT_USER.id && (
                        <button
                          className="ml-1 px-2 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold"
                          onClick={() => handleRemoveMember(member.userName)}
                        >
                          Remove
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </div>
            {/* Add Members Modal (stacked on top) */}
            {showAddMembersModal && (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-xl shadow-xl p-6 min-w-[320px] relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowAddMembersModal(false)}>&times;</button>
                  <h2 className="text-lg font-bold mb-4">Add Member</h2>
                  <div className="flex gap-2 mb-2 relative">
                    <input
                      type="text"
                      className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                      placeholder="Add member name..."
                      value={addMemberInput}
                      onChange={e => {
                        setAddMemberInput(e.target.value);
                        setAddMemberSuggestion(null);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMemberToGroup();
                        } else if (e.key === 'ArrowDown' && addFilteredSuggestions.length > 0) {
                          setAddMemberSuggestion(addFilteredSuggestions[0]);
                        }
                      }}
                      autoComplete="off"
                    />
                    {/* Suggestions dropdown */}
                    {addMemberInput && addFilteredSuggestions.length > 0 && (
                      <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded shadow z-10">
                        {addFilteredSuggestions.map((suggestion: string) => (
                          <div
                            key={suggestion}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-100 ${addMemberSuggestion === suggestion ? 'bg-purple-100' : ''}`}
                            onMouseDown={() => {
                              setAddMemberInput(suggestion);
                              setAddMemberSuggestion(suggestion);
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      className="px-3 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 text-sm font-semibold"
                      onClick={handleAddMemberToGroup}
                      disabled={
                        !WORKPLACE_MEMBERS.includes(addMemberInput.trim()) ||
                        getChatMembers(selectedChat).includes(addMemberInput.trim())
                      }
                    >Add</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Centered chat area with whitespace and min height */}
        <div className="flex-1 flex flex-col items-center justify-end overflow-y-auto min-h-0">
          <div className="w-full max-w-2xl flex flex-col gap-6 px-6 py-8 mx-auto min-h-[450px]">
            {(!selectedChat.messages || selectedChat.messages.length === 0) ? (
              <FadeContent className="text-gray-400 text-center mt-10" delay={300}>No messages yet.</FadeContent>
            ) : (
              selectedChat.messages.map((msg: Message, idx: number) => (
                <FadeContent 
                  key={msg._id || idx}
                  className={`flex ${msg.senderName === "You" ? "justify-end pl-16" : "justify-start pr-16"}`}
                  delay={300 + idx * 50}
                  duration={600}
                >
                  <div
                    className={`rounded-2xl px-5 py-3 max-w-[70%] text-sm shadow-md border ${
                      msg.senderName === "You"
                        ? "bg-white border-gray-300 text-gray-900"
                        : "bg-purple-100 border-purple-200 text-gray-800"
                    }`}
                    style={{wordBreak: 'break-word'}}
                  >
                    {/* Always show sender name above message unless it's 'You' */}
                    {msg.senderName !== "You" && (
                      <div className="font-bold text-xs mb-1 text-purple-700">{msg.senderName}</div>
                    )}
                    {msg.content}
                  </div>
                </FadeContent>
              ))
            )}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Message Input - Edge-to-Edge, WhatsApp style */}
        <FadeContent 
          className="flex items-center gap-2 p-4 border-t border-gray-200 bg-white sticky bottom-0 left-0 right-0 z-10 w-full"
          style={{boxShadow: '0 -2px 16px 0 rgba(80,0,120,0.06)'}}
          delay={400}
        >
          <form
            className="flex items-center gap-2 w-full"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              if (message.trim()) {
                const newMessage: Message = {
                  _id: `msg_${Date.now()}`,
                  channelId: selectedChat._id,
                  senderId: CURRENT_USER.id,
                  senderName: CURRENT_USER.name,
                  content: message,
                  type: "text",
                  status: "sent",
                  isDeleted: false,
                  isEdited: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };

                setSelectedChat((prev: Chat) => ({
                  ...prev,
                  messages: [...(prev.messages || []), newMessage],
                }));
                setMessage("");
              }
            }}
          >
            {/* Attachment Button */}
            <button type="button" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l7.07-7.07a4 4 0 00-5.657-5.657l-7.071 7.07a6 6 0 008.485 8.486l6.364-6.364" />
              </svg>
            </button>
            {/* Emoji Button */}
            <button type="button" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 15s1.5 2 4 2 4-2 4-2" />
              </svg>
            </button>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              placeholder="Type Message Here..."
              value={message}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              className="ml-2 p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
                style={{ transform: 'translate(1px, 1px)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6.75L16.5 12l-12 1.5v6.75z" />
              </svg>
            </button>
          </form>
        </FadeContent>
      </FadeContent>
    </div>
  );
};

export default Chats;
