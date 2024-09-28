import React from "react";
import Card from "src/components/Card";

const ActiveChatHeader = ({
  firstName = "",
  lastName = "",
  groupName = "",
  participantsNames = "",
  userPhoto = "",
}: {
  firstName?: string;
  lastName?: string;
  groupName?: string;
  participantsNames?: string;
  userPhoto?: string;
}) => {
  const fallbackName = `${firstName.slice(0, 1).toUpperCase()}${lastName
    .slice(0, 1)
    .toUpperCase()}`;
  return (
    <div className="bg-white text-gray-500 pt-2">
      <Card className="py-[0.70rem] flex items-center pl-4">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-cyan-500">
          {userPhoto ? (
            <img
              className="w-full h-full object-cover"
              src={userPhoto}
              alt="User Photo"
            />
          ) : (
            <div className="w-full h-full flex justify-center items-center pointer-events-none select-none">
              {fallbackName}
            </div>
          )}
        </div>
        <div className="pl-4">
          {participantsNames && groupName ? (
            <>
              {participantsNames} | {groupName}
            </>
          ) : (
            <>{`${firstName} ${lastName}`}</>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ActiveChatHeader;
