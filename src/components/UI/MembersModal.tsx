import { useState } from 'react';
import { OrganizationMember } from '../../services/organizationService';

interface MembersModalProps {
  members: OrganizationMember[];
  isAdmin: boolean;
  onClose: () => void;
  onAddMember: () => void;
  onRemoveMember: (member: OrganizationMember) => void;
}

const MembersModal: React.FC<MembersModalProps> = ({ 
  members, 
  isAdmin, 
  onClose, 
  onAddMember, 
  onRemoveMember 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(member =>
    member.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-[#5C346E]">
              Members ({members.length})
            </h3>
            {isAdmin && (
              <button
                onClick={onAddMember}
                className="bg-[#5C346E] text-white px-4 py-2 rounded-lg hover:bg-[#7d4ea7] transition-colors text-sm font-medium"
              >
                + Add Member
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C346E] focus:border-transparent"
          />
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredMembers.length > 0 ? (
            <div className="space-y-3">
              {filteredMembers.map(member => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-4 bg-[#f7f0ff] rounded-lg border border-[#e9e0f3]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#5C346E] text-white rounded-full flex items-center justify-center font-bold">
                      {member.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-[#5C346E]">
                        {member.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      member.role === 'admin' 
                        ? 'bg-[#5C346E] text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {member.role}
                    </span>
                      {isAdmin && member.role === 'member' && (
                      <button
                        onClick={() => onRemoveMember(member)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">
                {searchTerm ? 'No members found' : 'No members yet'}
              </div>
              {!searchTerm && isAdmin && (
                <button
                  onClick={onAddMember}
                  className="mt-4 bg-[#5C346E] text-white px-6 py-2 rounded-lg hover:bg-[#7d4ea7] transition-colors"
                >
                  Add Your First Member
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersModal;
