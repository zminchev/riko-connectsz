import Link from 'next/link';
import React from 'react';
import UserPhotoOrAbbreviation from 'src/components/UserPhotoOrAbbreviation/UserPhotoOrAbbreviation';
import { getUserLettersFromName } from 'src/utils/getUserLettersFromName';

interface ChatSidebarItemProps {
  firstName?: string;
  lastName?: string;
  groupName?: string;
  chatId?: string;
  groupId?: string;
  userPhoto?: string;
}

const ChatSidebarItem = ({
  firstName = '',
  lastName = '',
  groupName = '',
  chatId,
  groupId,
  userPhoto = '',
}: ChatSidebarItemProps) => {
  const joinedName = `${firstName} ${lastName}`;
  const { fallbackName } = getUserLettersFromName({ firstName, lastName });

  const linkHref = chatId ? `/chats/${chatId}` : `/groups/${groupId}`;

  return (
    <Link href={linkHref} className="px-2">
      <div className="bg-white text-gray-500 p-2 hover:bg-gray-300 hover:text-gray-700 transition-colors duration-150 rounded-sm">
        <div className="flex items-center gap-x-3">
          <UserPhotoOrAbbreviation
            userPhoto={userPhoto}
            fallbackName={fallbackName}
          />
          {!joinedName.trim() ? groupName : joinedName}
        </div>
      </div>
    </Link>
  );
};

export default ChatSidebarItem;
