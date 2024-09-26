import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

interface ChatSidebarItemProps {
  firstName?: string;
  lastName?: string;
  groupName?: string;
  chatId?: string;
  groupId?: string;
}

const ChatSidebarItem = ({
  firstName = "",
  lastName = "",
  groupName = "",
  chatId,
  groupId,
}: ChatSidebarItemProps) => {
  const router = useRouter();

  const joinedName = `${firstName} ${lastName}`;
  const isChatActive = router?.query?.id?.toString() === chatId;
  const isGroupActive = router?.query?.id?.toString() === groupId;
  const isActive = isChatActive || isGroupActive;

  const linkHref = chatId ? `/chats/${chatId}` : `/groups/${groupId}`;

  return (
    <Link href={linkHref}>
      <div
        className={`${
          isActive
            ? "bg-accent-secondary text-text-primary"
            : "bg-dark-primary hover:bg-accent-secondary hover:text-text-primary"
        }  hover:shadow-md shadow-sm transition-colors duraion-300 ease-in-out w-full text-center p-4 rounded-sm font-bold`}
      >
        {!joinedName.trim() ? groupName : joinedName}
      </div>
    </Link>
  );
};

export default ChatSidebarItem;
