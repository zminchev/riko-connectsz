import Image from 'next/image';
import React from 'react';

const UserPhotoOrAbbreviation = ({
  userPhoto,
  fallbackName,
  className = '',
}: {
  userPhoto?: string;
  fallbackName?: string;
  width?: string;
  height?: string;
  className?: string;
}) => {
  return (
    <div
      className={`w-10 h-10 rounded-full overflow-hidden border border-cyan-500 relative ${className}`}
    >
      {userPhoto ? (
        <Image
          className="w-full h-full object-cover"
          fill
          sizes=''
          src={userPhoto}
          alt="User Photo"
        />
      ) : (
        <div className="w-full h-full flex justify-center items-center">
          {fallbackName}
        </div>
      )}
    </div>
  );
};

export default UserPhotoOrAbbreviation;
