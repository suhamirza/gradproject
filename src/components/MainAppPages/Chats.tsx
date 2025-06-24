// This is the working version with all real backend integration
import { useState, useRef, useEffect } from "react";
import FadeContent from "../ReactBits/FadeContent";
import { chatService } from '../../services/chatService';
import { socketService } from '../../services/socketService';
import { useUser } from '../../context/UserContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { organizationService, type OrganizationMember } from '../../services/organizationService';

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

const Chats: React.FC = () => {
  const { user } = useUser();
  
  // Use workspace with proper error handling
  let currentWorkspace = null;
  let workspaceLoading = false;
  let workspaceError = null;
  try {
    const workspaceContext = useWorkspace();
    if (workspaceContext && typeof workspaceContext === 'object') {
      currentWorkspace = (workspaceContext as any).currentWorkspace;
      workspaceLoading = (workspaceContext as any).isLoading || false;
      workspaceError = (workspaceContext as any).error;
    }
  } catch (error) {
    console.warn('WorkspaceContext not available:', error);
    workspaceError = 'Workspace context not available';
  }
  
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [search, setSearch] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [workspaceMembers, setWorkspaceMembers] = useState<OrganizationMember[]>([]);

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [addMemberInput, setAddMemberInput] = useState("");
  const [addMemberSuggestion, setAddMemberSuggestion] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [newChatMembers, setNewChatMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState("");
  const [memberSuggestion, setMemberSuggestion] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatType, setChatType] = useState<'public' | 'private'>('public');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // Load real chats instead of dummy data
  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);        // Pass organization ID if available, otherwise get all chats
        const channels = await chatService.getChannels(); // Don't pass organizationId
        setChats(channels);
          // IMPORTANT: Join all channels immediately after loading
        const socket = socketService.getSocket();
        if (socket && channels.length > 0) {
          channels.forEach(chat => {
            socket.emit('joinChannel', { channelId: chat._id });
            console.log('🔗 Force-joined channel after loading:', chat._id, chat.name);
          });
        }
        
        // Set first chat as selected if none selected
        if (channels.length > 0 && !selectedChat) {
          setSelectedChat(channels[0]);
        }
      } catch (error) {
        console.error('Failed to load chats:', error);
        // Fallback to empty array instead of dummy data
        setChats([]);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [currentWorkspace]);

  // Load messages when a chat is selected
  useEffect(() => {
    const loadChatData = async () => {
      if (!selectedChat) return;

      try {
        console.log('🔍 Loading chat data for:', selectedChat._id);
        
        // Load messages and members in parallel
        const [messages, members] = await Promise.all([
          chatService.getMessages(selectedChat._id),
          chatService.getChannelMembers(selectedChat._id)
        ]);
        
        console.log('💬 Loaded messages:', messages.length);
        console.log('👥 Loaded members:', members.length);
        
        // Update selected chat with loaded data
        setSelectedChat(prev => prev ? {
          ...prev,
          messages: messages,
          members: members
        } : null);
        
        // Also update the chat in the chats array
        setChats(prev => prev.map(chat => 
          chat._id === selectedChat._id 
            ? { ...chat, messages: messages, members: members }
            : chat
        ));
      } catch (error) {
        console.error('❌ Failed to load chat data:', error);
        // Don't show alert for loading failures, just log
      }
    };

    loadChatData();
  }, [selectedChat?._id]); // Only trigger when selectedChat._id changes
  // Set up real-time messaging with WebSocket
  useEffect(() => {
    if (!user?.id || !currentWorkspace?.id) return;
    console.log('🔌 Setting up real-time messaging...');
    const socket = socketService.connect(user.id, currentWorkspace?.id);
      if (socket) {      // Listen for new messages - try both event names
      socket.on('new_message', (messageData: Message) => {
        console.log('📨 Received new_message:', messageData.content, 'from:', messageData.senderName);
        
        // Update chats if the message is for a channel we have
        setChats(prev => prev.map(chat => {
          if (chat._id === messageData.channelId) {
            return {
              ...chat,
              messages: [...(chat.messages || []), messageData],
              lastMessage: messageData.content,
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
          return chat;
        }));

        // Update selected chat if it's the same channel
        setSelectedChat(prev => {
          if (prev && prev._id === messageData.channelId) {
            return {
              ...prev,
              messages: [...(prev.messages || []), messageData]
            };
          }
          return prev;
        });
      });      // Also listen for 'message' event in case backend uses that
      socket.on('message', (messageData: Message) => {
        console.log('📨 Received message:', messageData.content, 'from:', messageData.senderName);
        
        // Update chats if the message is for a channel we have
        setChats(prev => prev.map(chat => {
          if (chat._id === messageData.channelId) {
            return {
              ...chat,
              messages: [...(chat.messages || []), messageData],
              lastMessage: messageData.content,
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
          return chat;
        }));

        // Update selected chat if it's the same channel
        setSelectedChat(prev => {
          if (prev && prev._id === messageData.channelId) {
            // Remove any temporary messages with the same content and replace with real message
            const filteredMessages = prev.messages?.filter(msg => 
              !(msg.status === 'sending' && msg.content === messageData.content)
            ) || [];
            
            return {
              ...prev,
              messages: [...filteredMessages, messageData]
            };
          }
          return prev;
        });
      });      // Listen for message read receipts
      socket.on('message_read', (data: { messageId: string; userId: string }) => {
        console.log('👁️ Message read:', data);
        // You can implement read receipts here if needed
      });

      // Listen for new channels being added
      socket.on('channelAdded', (data: { channel: Chat; addedBy: string }) => {
        console.log('📢 Added to new channel:', data.channel.name, 'by:', data.addedBy);
        
        // Add the new channel to the chats list
        setChats(prev => [data.channel, ...prev]);
        
        // Auto-join the channel        socket.emit('joinChannel', { channelId: data.channel._id });
      });

      // Listen for channel messages when joining a channel
      socket.on('channelMessages', (data: { channelId: string; messages: Message[]; readReceipts: any[] }) => {
        console.log('📬 Received channel messages:', data.messages.length, 'messages for channel:', data.channelId);
        
        // Update the selected chat with the messages if it matches
        setSelectedChat(prev => {
          if (prev && prev._id === data.channelId) {
            console.log('✅ Updating selected chat with', data.messages.length, 'messages');
            return {
              ...prev,
              messages: data.messages
            };
          }
          return prev;
        });
        
        // Also update the chat in the chats array
        setChats(prev => prev.map(chat => {
          if (chat._id === data.channelId) {
            return {
              ...chat,
              messages: data.messages,
              lastMessage: data.messages.length > 0 ? data.messages[data.messages.length - 1].content : '',
              lastMessageTime: data.messages.length > 0 ? new Date(data.messages[data.messages.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
            };
          }
          return chat;
        }));
      });

      // Join channels when we have them
      if (chats.length > 0) {
        chats.forEach(chat => {          socket.emit('joinChannel', { channelId: chat._id });
          console.log('🏠 Auto-joined channel on connect:', chat._id, chat.name);
        });
      }
    }// Cleanup on unmount
    return () => {      if (socket) {
        socket.off('new_message');
        socket.off('message');
        socket.off('message_read');
        socket.off('channelMessages');
        socket.off('channelAdded');
        socketService.disconnect();
      }};
  }, [user?.id, currentWorkspace?.id]); // Re-run when user or workspace changes// Join channel when selected chat changes
  useEffect(() => {
    if (selectedChat && user?.id) {      const socket = socketService.getSocket();
      if (socket && socket.connected) {
        socket.emit('joinChannel', { channelId: selectedChat._id });
        console.log('🏠 Joined channel:', selectedChat._id, selectedChat.name);
        
        // Also ensure we're listening for messages from this specific channel
        console.log('👂 Listening for messages on channel:', selectedChat._id);
      }
    }
  }, [selectedChat?._id, user?.id]);

  // Load workspace members from organization
  useEffect(() => {
    const loadWorkspaceMembers = async () => {
      if (!currentWorkspace) return;
      
      try {
        console.log('🔍 Loading workspace members for:', currentWorkspace.id);
        const response = await organizationService.getOrganizationMembers(currentWorkspace.id);
        console.log('👥 Loaded workspace members:', response.members);
        setWorkspaceMembers(response.members);
      } catch (error) {
        console.error('❌ Failed to load workspace members:', error);
        // Fallback to empty array on error
        setWorkspaceMembers([]);
      }
    };

    loadWorkspaceMembers();
  }, [currentWorkspace]);

  // Helper functions to work with backend-compatible data
  const getChatMembers = (chat: Chat | null): string[] => {
    return chat?.members?.map(member => member.userName) || [];
  };

  const isCurrentUserOwner = (chat: Chat | null): boolean => {
    return chat?.ownerId === user?.id;
  };

  // Filtered members for dropdowns (excluding current user and already selected members)
  const filteredMembersForNewChat = workspaceMembers.filter(m =>
    m.userName.toLowerCase().includes(memberInput.toLowerCase()) && 
    !newChatMembers.includes(m.userName) &&
    m.userName !== user?.username
  ).sort((a, b) => a.userName.localeCompare(b.userName));

  const filteredMembersForAdd = workspaceMembers.filter(m =>
    m.userName.toLowerCase().includes(addMemberInput.toLowerCase()) &&
    selectedChat &&
    !getChatMembers(selectedChat).includes(m.userName) &&
    m.userName !== user?.username
  ).sort((a, b) => a.userName.localeCompare(b.userName));

  const handleAddMember = () => {
    const trimmed = memberInput.trim();
    if (
      trimmed &&
      workspaceMembers.some(m => m.userName === trimmed) &&
      !newChatMembers.includes(trimmed) &&
      trimmed !== user?.username // Prevent adding self
    ) {
      setNewChatMembers([...newChatMembers, trimmed]);
      setMemberInput("");
      setMemberSuggestion(null);
    }
  };

  const handleCreateChat = async () => {
    if (!currentWorkspace) {
      alert('Please select a workspace first');
      return;
    }
    
    try {
      if (chatType === 'public') {
        if (!newChatName.trim()) {
          alert('Please enter a chat name');
          return;
        }
        
        // Backend should automatically add the creator, so we don't include them
        const membersToAdd = newChatMembers.filter(member => member !== user?.username);
        
        console.log('🗨️ Creating public chat:', newChatName, 'with members:', membersToAdd);
          const newChat = await chatService.createChannel(
          currentWorkspace?.id,
          newChatName,
          'public',
          membersToAdd // Don't include current user - backend should handle this
        );
        
        setChats([newChat, ...chats]);
        setShowCreateModal(false);
        setNewChatName('');
        setNewChatMembers([]);
        setChatType('public');
      } else {
        // Private chat - create with selected members
        if (newChatMembers.length !== 1) {
          alert('Private chats must have exactly 1 other member');
          return;
        }
        
        const otherMember = newChatMembers[0];
        if (otherMember === user?.username) {
          alert('You cannot create a private chat with yourself');
          return;
        }
        
        console.log('🗨️ Creating private chat with:', otherMember);
        
        const chatName = otherMember; // Use the other person's name
        const newChat = await chatService.createChannel(
          currentWorkspace?.id,
          chatName,
          'private',
          [otherMember] // Only include the other person, backend adds creator
        );
        
        setChats([newChat, ...chats]);
        setShowCreateModal(false);
        setNewChatName('');
        setNewChatMembers([]);
        setChatType('public');
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('Failed to create chat. Please try again.');
    }
  };

  const handleAddChatMember = async () => {
    const trimmed = addMemberInput.trim();
    if (
      trimmed &&
      workspaceMembers.some(m => m.userName === trimmed) &&
      selectedChat &&
      !getChatMembers(selectedChat).includes(trimmed)
    ) {
      try {
        await chatService.addMember(selectedChat._id, trimmed);
        
        // Update local state
        const newMember: ChannelMember = {
          _id: `member_${Date.now()}`,
          channelId: selectedChat._id,
          userId: `user_${trimmed.toLowerCase()}`,
          userName: trimmed,
          isActive: true,
          joinedAt: new Date().toISOString()
        };

        const updatedChats = chats.map(chat =>
          chat._id === selectedChat._id
            ? { ...chat, members: [...(chat.members || []), newMember] }
            : chat
        );
        setChats(updatedChats);
        
        setSelectedChat({ ...selectedChat, members: [...(selectedChat.members || []), newMember] });
        
        setAddMemberInput("");
        setAddMemberSuggestion(null);
        setShowAddMembersModal(false);
      } catch (error) {
        console.error('Failed to add member:', error);
        alert('Failed to add member. Please try again.');
      }
    }
  };

  const handleRemoveChatMember = async (memberName: string) => {
    if (!selectedChat) return;
    
    try {
      await chatService.removeMember(selectedChat._id, memberName);
      
      // Update local state
      const updatedChats = chats.map(chat =>
        chat._id === selectedChat._id
          ? { ...chat, members: chat.members?.filter(m => m.userName !== memberName) }
          : chat
      );
      setChats(updatedChats);
      
      setSelectedChat({
        ...selectedChat,
        members: selectedChat.members?.filter(m => m.userName !== memberName),
      });
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member. Please try again.');
    }
  };  // Handle chat selection
  const handleChatSelect = async (chat: Chat) => {
    console.log('🎯 Selecting chat:', chat.name, chat._id);
    setSelectedChat(chat);
    
    // Join the channel via socket
    const socket = socketService.getSocket();
    if (socket && socketService.isSocketConnected()) {
      console.log('🏠 Joining channel via socketService:', chat._id);
      socketService.joinChannel(chat._id);
    } else {
      console.warn('❌ Cannot join channel - socket not connected');
    }
    
    // Load messages and members for the selected chat
    try {
      const [messages, members] = await Promise.all([
        chatService.getMessages(chat._id),
        chatService.getChannelMembers(chat._id)
      ]);
      
      setSelectedChat(prev => prev && prev._id === chat._id ? {
        ...prev,
        messages: messages || [],
        members: members || []
      } : prev);
      
      console.log(`📬 Loaded ${messages?.length || 0} messages and ${members?.length || 0} members for chat: ${chat.name}`);
    } catch (error) {
      console.error('❌ Failed to load chat data:', error);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);
  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    const messageContent = message.trim();
    setMessage(""); // Clear input immediately for better UX

    // Create temporary message for immediate UI update
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`, // Temporary ID that will be replaced
      channelId: selectedChat._id,
      senderId: user?.id || 'current-user',
      senderName: user ? `${user.firstName} ${user.lastName}` : 'You',
      content: messageContent,
      type: 'text',
      status: 'sending',
      isDeleted: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update UI immediately with temporary message
    setSelectedChat(prev => prev ? {
      ...prev,
      messages: [...(prev.messages || []), tempMessage],
      lastMessage: messageContent,
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } : null);

    try {
      const socket = socketService.getSocket();
      console.log('🔍 Debug socket state:');
      console.log('  - Socket exists:', !!socket);
      console.log('  - Socket connected:', socket?.connected);
      console.log('  - isSocketConnected():', socketService.isSocketConnected());
      
      if (socket && socketService.isSocketConnected()) {
        console.log('📡 Sending message via WebSocket...', { channelId: selectedChat._id, content: messageContent });
        socketService.sendMessage(selectedChat._id, messageContent, 'text');
        console.log('✅ Message sent via WebSocket (waiting for confirmation)');
        
        // Set a timeout to detect if message was not received
        setTimeout(() => {
          // Check if the temporary message is still there (not replaced by real message)
          setSelectedChat(prev => {
            if (prev && prev.messages?.some(msg => msg._id === tempMessage._id && msg.status === 'sending')) {
              console.warn('⚠️ Message may not have been delivered - no confirmation received');
              // Update status to show potential delivery issue
              return {
                ...prev,
                messages: prev.messages.map(msg => 
                  msg._id === tempMessage._id ? { ...msg, status: 'pending' } : msg
                )
              };
            }
            return prev;
          });
        }, 5000); // 5 second timeout
        
      } else {
        console.error('❌ WebSocket not connected. Cannot send message.');
        throw new Error('Chat connection failed. Please refresh the page and try again.');
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      alert(`Failed to send message: ${error instanceof Error ? error.message : 'Please refresh the page and try again.'}`);
      // Remove the temporary message on failure and restore input
      setSelectedChat(prev => prev ? {
        ...prev,
        messages: prev.messages?.filter(msg => msg._id !== tempMessage._id) || []
      } : null);
      setMessage(messageContent); // Restore the message
    }
  };

  // Show loading state if workspace is loading
  if (workspaceLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading workspace...</div>
      </div>
    );
  }

  // Show error state if workspace failed to load
  if (workspaceError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error: {workspaceError}</div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  // Show empty state if no workspace selected
  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Please select a workspace to view chats</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              + New Chat
            </button>
          </div>
          
          <div className="relative">
            <svg
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No chats yet. Create your first chat!
            </div>
          ) : (
            chats
              .filter(chat => 
                chat.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((chat) => (
                <div key={chat._id}>
                  <FadeContent delay={150} duration={800}>                    <div
                      onClick={() => handleChatSelect(chat)}
                      className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${
                        selectedChat?._id === chat._id ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {chat.type === 'private' ? chat.name.charAt(0).toUpperCase() : '#'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chat.type === 'private' ? chat.name : `# ${chat.name}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {chat.lastMessageTime || new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                        {chat.unreadCount && chat.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  </FadeContent>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">
                      {selectedChat.type === 'private' ? selectedChat.name.charAt(0).toUpperCase() : '#'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedChat.type === 'private' ? selectedChat.name : `# ${selectedChat.name}`}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {getChatMembers(selectedChat).length} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowMembersModal(true)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedChat.messages && selectedChat.messages.length > 0 ? (
                selectedChat.messages.map((msg) => {
                  const isOwnMessage = msg.senderId === user?.id || msg.senderName === user?.username || msg.senderName === 'You';
                  
                  return (
                    <div key={msg._id}>
                      <FadeContent delay={100} duration={600}>
                        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
                          <div className={`flex items-start space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* Avatar - only show for incoming messages */}
                            {!isOwnMessage && (
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-gray-600 font-semibold text-xs">
                                  {msg.senderName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            
                            {/* Message bubble */}
                            <div className={`rounded-lg px-4 py-2 ${
                              isOwnMessage 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              {/* Sender name - only show for incoming messages */}
                              {!isOwnMessage && (
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                  {msg.senderName}
                                </div>
                              )}
                              
                              {/* Message content */}
                              <p className="text-sm">{msg.content}</p>
                              
                              {/* Timestamp */}
                              <div className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-purple-100' : 'text-gray-500'
                              }`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </FadeContent>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                {/* Attachment Button */}
                <button
                  type="button"
                  onClick={() => console.log('Attachment functionality coming soon...')}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  title="Add attachment"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                
                {/* Emoji Button */}
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  title="Add emoji"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                {/* Message Input */}
                <input
                  type="text"
                  value={message}
                  onChange={(e: any) => setMessage(e.target.value)}
                  placeholder={`Message ${selectedChat.type === 'private' ? selectedChat.name : `# ${selectedChat.name}`}`}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Send message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No chat selected</h3>
              <p className="mt-1 text-sm text-gray-500">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Chat Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Chat</h3>
            
            <div className="mb-4">
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setChatType('public')}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    chatType === 'public' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => setChatType('private')}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    chatType === 'private' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Private
                </button>
              </div>

              {chatType === 'public' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chat Name
                  </label>
                  <input
                    type="text"
                    value={newChatName}
                    onChange={(e: any) => setNewChatName(e.target.value)}
                    placeholder="Enter chat name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Members
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={memberInput}
                    onChange={(e: any) => {
                      setMemberInput(e.target.value);
                      const suggestion = filteredMembersForNewChat.find(m =>
                        m.userName.toLowerCase().startsWith(e.target.value.toLowerCase())
                      );
                      setMemberSuggestion(suggestion?.userName || null);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMember();
                      } else if (e.key === "Tab" && memberSuggestion) {
                        e.preventDefault();
                        setMemberInput(memberSuggestion);
                      }
                    }}
                    placeholder="Type member name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {memberSuggestion && memberInput && (
                    <div className="absolute top-0 left-0 w-full px-3 py-2 text-gray-400 pointer-events-none">
                      <span className="invisible">{memberInput}</span>
                      <span>{memberSuggestion.slice(memberInput.length)}</span>
                    </div>
                  )}
                </div>
                
                {filteredMembersForNewChat.length > 0 && memberInput && (
                  <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                    {filteredMembersForNewChat.slice(0, 5).map((member) => (
                      <div
                        key={member.userId}
                        onClick={() => {
                          setMemberInput(member.userName);
                          handleAddMember();
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {member.userName}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleAddMember}
                  disabled={
                    !memberInput.trim() ||
                    !workspaceMembers.some(m => m.userName === memberInput.trim()) ||
                    newChatMembers.includes(memberInput.trim())
                  }
                  className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Member
                </button>
              </div>

              {newChatMembers.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Members:</p>
                  <div className="flex flex-wrap gap-2">
                    {newChatMembers.map((member) => (
                      <span
                        key={member}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {member}
                        <button
                          onClick={() => setNewChatMembers(newChatMembers.filter(m => m !== member))}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewChatName("");
                  setNewChatMembers([]);
                  setMemberInput("");
                  setChatType('public');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChat}
                disabled={
                  (chatType === 'public' && (!newChatName.trim() || newChatMembers.length === 0)) ||
                  (chatType === 'private' && newChatMembers.length !== 1)
                }
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chat Members</h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {getChatMembers(selectedChat).map((member) => (
                <div key={member} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-600 font-semibold text-sm">
                        {member.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-900">{member}</span>
                    {selectedChat.ownerName === member && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                  {isCurrentUserOwner(selectedChat) && member !== user?.username && (
                    <button
                      onClick={() => handleRemoveChatMember(member)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isCurrentUserOwner(selectedChat) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowMembersModal(false);
                    setShowAddMembersModal(true);
                  }}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Members
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      {showAddMembersModal && selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Member</h3>
            
            <div className="relative mb-4">
              <input
                type="text"
                value={addMemberInput}
                onChange={(e: any) => {
                  setAddMemberInput(e.target.value);
                  const suggestion = filteredMembersForAdd.find(m =>
                    m.userName.toLowerCase().startsWith(e.target.value.toLowerCase())
                  );
                  setAddMemberSuggestion(suggestion?.userName || null);
                }}
                placeholder="Type member name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {addMemberSuggestion && addMemberInput && (
                <div className="absolute top-0 left-0 w-full px-3 py-2 text-gray-400 pointer-events-none">
                  <span className="invisible">{addMemberInput}</span>
                  <span>{addMemberSuggestion.slice(addMemberInput.length)}</span>
                </div>
              )}
            </div>
            
            {filteredMembersForAdd.length > 0 && addMemberInput && (
              <div className="mb-4 bg-white border border-gray-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                {filteredMembersForAdd.slice(0, 5).map((member) => (
                  <div
                    key={member.userId}
                    onClick={() => setAddMemberInput(member.userName)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {member.userName}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddMembersModal(false);
                  setAddMemberInput("");
                  setAddMemberSuggestion(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChatMember}
                disabled={
                  !addMemberInput.trim() ||
                  !workspaceMembers.some(m => m.userName === addMemberInput.trim()) ||
                  getChatMembers(selectedChat).includes(addMemberInput.trim())
                }
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
