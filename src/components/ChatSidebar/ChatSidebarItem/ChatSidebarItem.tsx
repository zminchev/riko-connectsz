import Link from "next/link";
import { useRouter } from "next/router";
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
  const router = useRouter();

  const joinedName = `${firstName} ${lastName}`;
  const isActive = router?.query?.slug?.toString() === chatId;

  return (
    <Link href={`/chats/${chatId}`}>
      <div
        className={`${
          isActive
            ? "bg-accent-secondary text-text-primary"
            : "bg-dark-primary hover:bg-accent-secondary hover:text-text-primary"
        }  hover:shadow-md shadow-sm transition-colors duraion-300 ease-in-out w-full text-center p-4 rounded-sm font-bold`}
      >
        {joinedName}
      </div>
    </Link>
  );
};

export default ChatSidebarItem;
