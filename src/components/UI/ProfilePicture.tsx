import React from 'react';

interface ProfilePictureProps {
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePictureUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  firstName,
  lastName,
  username,
  profilePictureUrl,
  size = 'md',
  className = '',
  onClick
}) => {
  // Get user initials from name or username
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Size configurations
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl'
  };

  const baseClasses = `
    rounded-full 
    flex 
    items-center 
    justify-center 
    font-bold 
    transition-all 
    duration-200
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
    ${sizeClasses[size]}
    ${className}
  `;

  // If custom profile picture exists, show it
  if (profilePictureUrl) {
    return (
      <div className={baseClasses} onClick={onClick}>
        <img
          src={profilePictureUrl}
          alt="Profile"
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show initials instead
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Fallback initials if image fails */}
        <span className="bg-[#b38fff] text-white w-full h-full rounded-full flex items-center justify-center">
          {getInitials()}
        </span>
      </div>
    );
  }

  // Default: Show initials with gradient background
  return (
    <div
      className={`${baseClasses} bg-gradient-to-br from-[#b38fff] to-[#9759b3] text-white shadow-md`}
      onClick={onClick}
    >
      {getInitials()}
    </div>
  );
};

export default ProfilePicture;
