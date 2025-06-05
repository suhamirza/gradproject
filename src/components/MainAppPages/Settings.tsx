import React from 'react';
import FadeContent from '../ReactBits/FadeContent';
import { authService } from '../../services/authService';

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  taskReminders: boolean;
  deadlineAlerts: boolean;
  teamNotifications: boolean;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

export default function Settings() {
  // Notification preferences state
  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    taskReminders: true,
    deadlineAlerts: true,
    teamNotifications: true,
  });

  // Account settings state
  const [userProfile, setUserProfile] = React.useState<UserProfile>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
  });
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPasswordChange, setShowPasswordChange] = React.useState(false);
  const [showSignOutModal, setShowSignOutModal] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [passwordModalContent, setPasswordModalContent] = React.useState({ type: '', message: '' });

  // Load user profile on component mount
  React.useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUserProfile({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
      });
    }
  }, []);
  // Handle notification setting toggle
  const handleNotificationToggle = (setting: keyof NotificationSettings) => {
    setNotificationSettings((prev: NotificationSettings) => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      // TODO: Implement API call to update user profile
      console.log('Updating profile:', userProfile);
      setIsEditingProfile(false);
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show error message
    }
  };
  // Handle password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordModalContent({ type: 'error', message: 'New passwords do not match' });
      setShowPasswordModal(true);
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordModalContent({ type: 'error', message: 'Password must be at least 6 characters long' });
      setShowPasswordModal(true);
      return;
    }

    try {
      // TODO: Implement API call to change password
      console.log('Changing password');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      setPasswordModalContent({ type: 'success', message: 'Password changed successfully' });
      setShowPasswordModal(true);
    } catch (error) {
      console.error('Failed to change password:', error);
      setPasswordModalContent({ type: 'error', message: 'Failed to change password' });
      setShowPasswordModal(true);
    }
  };
  // Handle sign out
  const handleSignOut = async () => {
    setShowSignOutModal(true);
  };

  // Confirm sign out
  const confirmSignOut = async () => {
    try {
      await authService.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };  return (
    <FadeContent>
      <div className="max-w-5xl mx-auto px-8 py-8 relative">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-[2.75rem] font-extrabold text-[#180620]">
            Settings
          </h1>
          <div className="mt-2 text-gray-500">
            Manage your account and preferences
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="mb-8 bg-white p-6 rounded-2xl border-2 border-[#c7b3d6] shadow-sm hover:border-[#5C346E] transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#5C346E]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <h3 className="text-xl font-bold text-[#5C346E]">Account Settings</h3>
          </div>

          {/* Profile Information */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5C346E] mb-2">First Name</label>
                <input
                  type="text"
                  value={userProfile.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserProfile((prev: UserProfile) => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-3 border-2 border-[#c7b3d6] rounded-lg outline-none transition-all duration-200 ${
                    isEditingProfile 
                      ? 'focus:border-[#5C346E] hover:border-[#5C346E] bg-white' 
                      : 'bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C346E] mb-2">Last Name</label>
                <input
                  type="text"
                  value={userProfile.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserProfile((prev: UserProfile) => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-3 border-2 border-[#c7b3d6] rounded-lg outline-none transition-all duration-200 ${
                    isEditingProfile 
                      ? 'focus:border-[#5C346E] hover:border-[#5C346E] bg-white' 
                      : 'bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#5C346E] mb-2">Username</label>
              <input
                type="text"
                value={userProfile.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserProfile((prev: UserProfile) => ({ ...prev, username: e.target.value }))}
                disabled={!isEditingProfile}
                className={`w-full px-4 py-3 border-2 border-[#c7b3d6] rounded-lg outline-none transition-all duration-200 ${
                  isEditingProfile 
                    ? 'focus:border-[#5C346E] hover:border-[#5C346E] bg-white' 
                    : 'bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5C346E] mb-2">Email</label>
              <input
                type="email"
                value={userProfile.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserProfile((prev: UserProfile) => ({ ...prev, email: e.target.value }))}
                disabled={!isEditingProfile}
                className={`w-full px-4 py-3 border-2 border-[#c7b3d6] rounded-lg outline-none transition-all duration-200 ${
                  isEditingProfile 
                    ? 'focus:border-[#5C346E] hover:border-[#5C346E] bg-white' 
                    : 'bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>
          </div>

          {/* Profile Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-6 py-2 bg-[#5C346E] text-white rounded-lg font-medium hover:bg-[#4A2B5A] transition-colors duration-200"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleProfileUpdate}
                  className="px-6 py-2 bg-[#5C346E] text-white rounded-lg font-medium hover:bg-[#4A2B5A] transition-colors duration-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
              </>
            )}
            
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
            >
              Change Password
            </button>
          </div>

          {/* Password Change Section */}
          {showPasswordChange && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-[#5C346E] mb-4">Change Password</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#5C346E] mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5C346E] mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5C346E] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#c7b3d6] rounded-lg outline-none focus:border-[#5C346E] transition-all duration-200"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePasswordChange}
                    className="px-4 py-2 bg-[#5C346E] text-white rounded-lg font-medium hover:bg-[#4A2B5A] transition-colors duration-200"
                  >
                    Update Password
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notification Preferences Section */}
        <div className="mb-8 bg-white p-6 rounded-2xl border-2 border-[#c7b3d6] shadow-sm hover:border-[#5C346E] transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#5C346E]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <h3 className="text-xl font-bold text-[#5C346E]">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-[#5C346E]">Push Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications in your browser</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('pushNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  notificationSettings.pushNotifications ? 'bg-[#5C346E]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-[#5C346E]">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  notificationSettings.emailNotifications ? 'bg-[#5C346E]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Task Reminders */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-[#5C346E]">Task Reminders</h4>
                <p className="text-sm text-gray-600">Get reminded about upcoming tasks</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('taskReminders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  notificationSettings.taskReminders ? 'bg-[#5C346E]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    notificationSettings.taskReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Deadline Alerts */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-[#5C346E]">Deadline Alerts</h4>
                <p className="text-sm text-gray-600">Get alerted when deadlines are approaching</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('deadlineAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  notificationSettings.deadlineAlerts ? 'bg-[#5C346E]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    notificationSettings.deadlineAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Team Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-[#5C346E]">Team Notifications</h4>
                <p className="text-sm text-gray-600">Receive updates from team members and collaborations</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('teamNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  notificationSettings.teamNotifications ? 'bg-[#5C346E]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    notificationSettings.teamNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#c7b3d6] shadow-sm hover:border-[#5C346E] transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#5C346E]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <h3 className="text-xl font-bold text-[#5C346E]">Account Actions</h3>
          </div>          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>        {/* Sign Out Confirmation Modal */}
        {showSignOutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border-2 border-[#5C346E] relative">
              <button
                className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
                onClick={() => setShowSignOutModal(false)}
              >
                &times;
              </button>
              
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-[#5C346E] mb-2">Sign Out</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to sign out? You'll need to sign in again to access your account.
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowSignOutModal(false)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSignOut}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Feedback Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border-2 border-[#5C346E] relative">
              <button
                className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#5C346E] focus:outline-none"
                onClick={() => setShowPasswordModal(false)}
              >
                &times;
              </button>
              
              <div className="text-center">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                  passwordModalContent.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {passwordModalContent.type === 'success' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  )}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${
                  passwordModalContent.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {passwordModalContent.type === 'success' ? 'Success' : 'Error'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {passwordModalContent.message}
                </p>
                
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className={`px-6 py-2 text-white rounded-lg font-medium transition-colors duration-200 ${
                    passwordModalContent.type === 'success' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FadeContent>
  );
}
