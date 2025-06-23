import { useState } from 'react';

interface AddMemberModalProps {
  organizationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ organizationId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    role: 'member' as 'admin' | 'member'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId.trim() || !formData.userName.trim()) {
      setError('User ID and Username are required');
      return;
    }

    setLoading(true);
    setError('');    try {
      const { organizationService } = await import('../../services/organizationService');
      console.log('Attempting to add member:', formData);
      console.log('Organization ID:', organizationId);
      
      const response = await organizationService.addOrganizationMember(organizationId, formData);
      console.log('Add member API response:', response);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Add member error:', err);
      console.error('Error details:', {
        message: err.message,
        statusCode: err.statusCode,
        errors: err.errors
      });
      
      // Provide more specific error messages
      if (err.statusCode === 403) {
        setError('Access denied. You must be an admin to add members.');
      } else if (err.statusCode === 404) {
        setError('User not found. Please check the User ID and Username.');
      } else if (err.statusCode === 400) {
        setError(err.message || 'Invalid request. Please check your input.');
      } else {
        setError(err.message || 'Failed to add member');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Member</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID *
            </label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, userId: e.target.value })}
              placeholder="Enter exact user ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="Enter exact username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, role: e.target.value as 'admin' | 'member' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
            <strong>Note:</strong> You need the exact User ID and Username. If they don't match existing users, an error will occur.
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#5C346E] text-white rounded-md hover:bg-[#7d4ea7] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
