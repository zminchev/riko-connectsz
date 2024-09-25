import Link from "next/link";
import React from "react";

interface ChatSidebarItemProps {
  firstName?: string;
  lastName?: string;
  chatId: string;
}

const ChatSidebarItem = ({
  firstName = "",
  lastName = "",
  chatId,
}: ChatSidebarItemProps) => {
  const joinedName = `${firstName} ${lastName}`;
  return (
    <Link href={`/chats/${chatId}`}>
      <div className="bg-dark-primary hover:bg-accent-secondary hover:text-text-primary hover:shadow-md shadow-sm transition-colors duraion-300 ease-in-out w-full text-center p-4 rounded-sm font-bold">
        {joinedName}
      </div>
    </Link>
  );
};

export default ChatSidebarItem;
