import React from 'react';
import UserPhotoOrAbbreviation from 'src/components/UserPhotoOrAbbreviation/UserPhotoOrAbbreviation';
import { getUserLettersFromName } from 'src/utils/getUserLettersFromName';
const ChatMessage = ({
  isOtherUser,
  senderName,
  lastMessageTime,
  content,
  userPhoto = '',
}: {
  isOtherUser: boolean;
  senderName: string;
  lastMessageTime: string;
  content: string;
  userPhoto?: string;
}) => {
  const firstName = senderName.split(' ')[0];
  const lastName = senderName.split(' ')[1];

  const { fallbackName } = getUserLettersFromName({ firstName, lastName });

  return (
    <div
      className={`flex w-full relative ${
        isOtherUser ? 'justify-end' : 'justify-start'
      } mb-6`}
    >
      <span
        className={`absolute -top-4 text-xs ${
          isOtherUser ? 'text-right right-14' : 'text-left left-12'
        }`}
      >
        {senderName || ''}
      </span>
      <div className={`flex ${isOtherUser ? 'flex-row-reverse' : ''}`}>
        <div className="my-auto mb-4">
          <UserPhotoOrAbbreviation
            className={`${isOtherUser ? 'ml-2' : 'mr-2'}`}
            width="10"
            height="10"
            fallbackName={fallbackName}
            userPhoto={userPhoto}
          />
        </div>
        <div className="flex flex-col">
          <div
            className={`p-3 max-w-xs relative text-message-text shadow-md text-left ${
              isOtherUser
                ? 'bg-other-user rounded-t-md rounded-bl-md'
                : 'bg-cyan-500 rounded-t-md rounded-br-md'
            }`}
          >
            <span className="text-md break-words whitespace-normal text-center">
              {content}
            </span>
          </div>
          <span
            className={`text-xs pt-1 ${
              isOtherUser ? 'text-right' : 'text-left'
            }`}
          >
            {lastMessageTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
