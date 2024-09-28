import React from 'react';

const UserPhotoOrAbbreviation = ({
  userPhoto,
  fallbackName,
  width = '12',
  height = '12',
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
      className={`${className} w-${width} h-${height} rounded-full overflow-hidden border border-cyan-500`}
    >
      {userPhoto ? (
        <img
          className="w-full h-full object-cover"
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
