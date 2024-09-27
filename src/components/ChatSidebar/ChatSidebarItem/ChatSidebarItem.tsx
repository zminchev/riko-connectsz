import Link from "next/link";
// import { useRouter } from "next/router";
import React from "react";

interface ChatSidebarItemProps {
  firstName?: string;
  lastName?: string;
  groupName?: string;
  chatId?: string;
  groupId?: string;
  userPhoto?: string;
}

const ChatSidebarItem = ({
  firstName = "",
  lastName = "",
  groupName = "",
  chatId,
  groupId,
  userPhoto = "",
}: ChatSidebarItemProps) => {
  // const router = useRouter();

  const joinedName = `${firstName} ${lastName}`;
  const fallbackName = `${firstName.slice(0, 1).toUpperCase()}${lastName
    .slice(0, 1)
    .toUpperCase()}`;
  // const isChatActive = router?.query?.id?.toString() === chatId;
  // const isGroupActive = router?.query?.id?.toString() === groupId;
  // const isActive = isChatActive || isGroupActive;

  const linkHref = chatId ? `/chats/${chatId}` : `/groups/${groupId}`;

  return (
    <Link href={linkHref} className="px-2">
      <div className="bg-white text-gray-500 p-2 hover:bg-gray-300 hover:text-gray-700 transition-colors duration-150 rounded-sm">
        <div className="flex items-center gap-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-cyan-500">
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
          {!joinedName.trim() ? groupName : joinedName}
        </div>
      </div>
    </Link>
  );
};

export default ChatSidebarItem;
