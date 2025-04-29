import React, { useState, useRef, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";

// Types for chat and message
interface Message {
  sender: string;
  text: string;
  time: string;
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
  members: string[];
  owner: string; // NEW: owner/creator of the group
  admins: string[]; // NEW: admin members
}

// Dummy data for demonstration
const dummyChats: Chat[] = [
  {
    id: 1,
    name: "General",
    lastMessage: "Hey guys, I think that we should...",
    time: "8:13 pm",
    unread: 2,
    messages: [
      { sender: "Yahya", text: "hey suha, i was thinking lets start the frontend work today? we could get a proper headstart and we have a bunch of exams coming up too. if we start now it’ll be easier on us", time: "8:13 pm" },
      { sender: "You", text: "Yeah i was thinking the same. shall i begin the design on figma rn then? i can start up the file and send you the link", time: "8:14 pm" },
      { sender: "Suha", text: "yes do it, i'll check and add some screens too", time: "8:15 pm" },
      { sender: "You", text: "Oh yes you’re right it would be best to do that tbh. alright lets do it on my ipad then, ill share screen on it", time: "8:16 pm" },
      { sender: "Yahya", text: "Sure, why dont you give me a couple of minutes and we can begin? i just have some things to take care of first.", time: "8:17 pm" },
    ],
    members: ["Yahya", "Suha", "Aisha", "You"],
    owner: "Suha",
    admins: ["Suha", "You"],
  },
  {
    id: 2,
    name: "Frontend",
    lastMessage: "So far the frontend, we are using Re...",
    time: "5:45 pm",
    unread: 5,
    messages: [],
    members: ["Yahya", "You"],
    owner: "Yahya",
    admins: ["Yahya"],
  },
  {
    id: 3,
    name: "Yahya",
    lastMessage: "Sure, why dont you give me a co...",
    time: "5:45 pm",
    unread: 0,
    messages: [
      { sender: "Yahya", text: "Sure, why dont you give me a couple of minutes and we can begin? i just have some things to take care of first.", time: "5:45 pm" },
    ],
    members: ["Yahya", "You"],
    owner: "Yahya",
    admins: ["Yahya"],
  },
];

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

  const handleAddMember = () => {
    const trimmed = memberInput.trim();
    // Only add if it's a valid workplace member and not already added
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
    if (!newChatName.trim() || newChatMembers.length === 0) return;
    const creator = "You"; // In real app, this would be the logged-in user
    const newChat: Chat = {
      id: Date.now(),
      name: newChatName,
      lastMessage: "",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      unread: 0,
      messages: [],
      members: [creator, ...newChatMembers.filter(m => m !== creator)],
      owner: creator,
      admins: [creator],
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newChat);
    setShowCreateModal(false);
    setNewChatName("");
    setNewChatMembers([]);
    setMemberInput("");
  };

  const addFilteredSuggestions = WORKPLACE_MEMBERS.filter(
    (m: string) =>
      m.toLowerCase().includes(addMemberInput.toLowerCase()) &&
      !selectedChat.members.includes(m)
  );

  const handleAddMemberToGroup = () => {
    const trimmed = addMemberInput.trim();
    if (
      trimmed &&
      WORKPLACE_MEMBERS.includes(trimmed) &&
      !selectedChat.members.includes(trimmed)
    ) {
      setChats((chats) => chats.map((chat) =>
        chat.id === selectedChat.id
          ? { ...chat, members: [...chat.members, trimmed] }
          : chat
      ));
      setSelectedChat((chat) => ({ ...chat, members: [...chat.members, trimmed] }));
      setAddMemberInput("");
      setAddMemberSuggestion(null);
    }
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat.messages]);

  return (
    <div className="flex h-full min-h-0" style={{height: '100%'}}>
      {/* Sidebar Chat List */}
      <div className="w-1/3 min-w-[250px] border-r border-gray-300 bg-white flex flex-col h-full min-h-0">
        {/* Header with Chats title and plus button */}
        <div className="flex items-center justify-between px-6 py-6 pb-4">
          <h2 className="text-2xl font-bold">Chats</h2>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white text-1xl shadow transition font-bold"
            title="New Chat"
            onClick={() => setShowCreateModal(true)}
          >
            +
          </button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="mx-6 mb-2 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring w-auto"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${selectedChat.id === chat.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="bg-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-md font-bold text-white mr-4">
                {chat.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{chat.name}</div>
                <div className="text-xs text-gray-500 truncate">{chat.lastMessage}</div>
              </div>
              <div className="flex flex-col items-end ml-4 min-w-[48px]">
                <span className="text-xs text-gray-400 mb-1">{chat.time}</span>
                {chat.unread > 0 && (
                  <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow mt-0.5">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Create Chat Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl p-8 min-w-[340px] relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowCreateModal(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Create New Chat</h2>
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
              <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">Members</label>
                <div className="flex gap-2 mb-2 relative">
                  <input
                    type="text"
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                    placeholder="Add member name..."
                    value={memberInput}
                    onChange={e => {
                      setMemberInput(e.target.value);
                      setMemberSuggestion(null);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMember();
                      } else if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
                        setMemberSuggestion(filteredSuggestions[0]);
                      }
                    }}
                    autoComplete="off"
                  />
                  {/* Suggestions dropdown */}
                  {memberInput && filteredSuggestions.length > 0 && (
                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded shadow z-10">
                      {filteredSuggestions.map(suggestion => (
                        <div
                          key={suggestion}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-100 ${memberSuggestion === suggestion ? 'bg-purple-100' : ''}`}
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
                      newChatMembers.includes(memberInput.trim())
                    }
                  >Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newChatMembers.map(member => (
                    <span key={member} className="bg-gray-200 rounded-2xl px-4 py-1 text-sm font-medium flex items-center gap-1">
                      {member}
                      <button type="button" className="ml-1 text-gray-400 hover:text-gray-700" onClick={() => setNewChatMembers(newChatMembers.filter(m => m !== member))}>&times;</button>
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
                  disabled={!newChatName.trim() || newChatMembers.length === 0}
                >Create</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-[#fcfbff] h-full min-h-0 relative">
        <div className="flex items-center p-6 border-b border-gray-200 cursor-pointer select-none" onClick={() => setShowMembersModal(true)}>
          <div className="bg-purple-400 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold text-white mr-4">
            {selectedChat.name[0]}
          </div>
          <div>
            <div className="text-2xl font-bold">{selectedChat.name}</div>
            {/* Group members inline display */}
            {selectedChat.members.length > 2 && (
              <div className="text-xs text-gray-500 mt-1">
                {selectedChat.members.slice(0, 5).join(", ")}
                {selectedChat.members.length > 5 && (
                  <>
                    {", "}
                    <span
                      className="underline cursor-pointer hover:text-purple-600"
                      onClick={e => {
                        e.stopPropagation();
                        setShowMembersModal(true);
                      }}
                    >
                      and {selectedChat.members.length - 5} more
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
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowMembersModal(false)}>&times;</button>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Group Members</h2>
                {/* Add member button in modal */}
                {selectedChat.owner === "You" || selectedChat.admins.includes("You") ? (
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold shadow ml-2"
                    title="Add member"
                    onClick={() => setShowAddMembersModal(true)}
                  >+
                  </button>
                ) : null}
              </div>
              {/* Owner at top */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-purple-700">{selectedChat.owner}</span>
                <span className="bg-yellow-300 text-yellow-900 rounded px-2 py-0.5 text-xs font-semibold">Owner</span>
                {selectedChat.admins.includes(selectedChat.owner) && (
                  <span className="bg-purple-200 text-purple-700 rounded px-2 py-0.5 text-xs ml-1">Admin</span>
                )}
              </div>
              {/* Other members */}
              <div className="flex flex-col gap-1">
                {selectedChat.members.filter(m => m !== selectedChat.owner).map(member => (
                  <div key={member} className="flex items-center gap-2">
                    <span>{member}</span>
                    {selectedChat.admins.includes(member) && (
                      <span className="bg-purple-200 text-purple-700 rounded px-2 py-0.5 text-xs">Admin</span>
                    )}
                    {/* Only owner/admin can remove, can't remove owner or yourself */}
                    {(selectedChat.owner === "You" || selectedChat.admins.includes("You")) && member !== selectedChat.owner && member !== "You" && (
                      <button
                        className="ml-1 px-2 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold"
                        onClick={() => {
                          setChats(chats => chats.map(chat =>
                            chat.id === selectedChat.id
                              ? { ...chat, members: chat.members.filter(m => m !== member), admins: chat.admins.filter(a => a !== member) }
                              : chat
                          ));
                          setSelectedChat(chat => ({ ...chat, members: chat.members.filter(m => m !== member), admins: chat.admins.filter(a => a !== member) }));
                        }}
                      >Remove</button>
                    )}
                    {/* Only owner can make admin, can't make owner admin again */}
                    {selectedChat.owner === "You" && !selectedChat.admins.includes(member) && member !== selectedChat.owner && (
                      <button
                        className="ml-1 px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold"
                        onClick={() => {
                          setChats(chats => chats.map(chat =>
                            chat.id === selectedChat.id
                              ? { ...chat, admins: [...chat.admins, member] }
                              : chat
                          ));
                          setSelectedChat(chat => ({ ...chat, admins: [...chat.admins, member] }));
                        }}
                      >Make Admin</button>
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
                        selectedChat.members.includes(addMemberInput.trim())
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
          <div className="w-full max-w-2xl flex flex-col gap-6 px-6 py-8 mx-auto min-h-[450px]"> {/* You can modify the min height of the chat area here */}
            {selectedChat.messages.length === 0 ? (
              <div className="text-gray-400 text-center mt-10">No messages yet.</div>
            ) : (
              selectedChat.messages.map((msg: Message, idx: number) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl px-5 py-3 max-w-[70%] text-sm shadow-md border ${
                      msg.sender === "You"
                        ? "bg-white border-gray-300 text-gray-900"
                        : "bg-purple-100 border-purple-200 text-gray-800"
                    }`}
                    style={{wordBreak: 'break-word'}}
                  >
                    {/* Always show sender name above message unless it's 'You' */}
                    {msg.sender !== "You" && (
                      <div className="font-bold text-xs mb-1 text-purple-700">{msg.sender}</div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {/* Message Input - Edge-to-Edge, WhatsApp style */}
        <form
          className="flex items-center gap-2 p-4 border-t border-gray-200 bg-white sticky bottom-0 left-0 right-0 z-10 w-full"
          style={{boxShadow: '0 -2px 16px 0 rgba(80,0,120,0.06)'}} 
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (message.trim()) {
              setSelectedChat((prev: Chat) => ({
                ...prev,
                messages: [
                  ...prev.messages,
                  { sender: "You", text: message, time: "Now" },
                ],
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6.75L16.5 12l-12 1.5v6.75z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chats;
