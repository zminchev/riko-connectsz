import React from "react";
import { Chat } from "src/types/Chat.types";
import ChatSidebarItem from "./ChatSidebarItem";
interface ChatSidebarProps {
  chats: Chat[];
  currentUserId: string;
}

const ChatSidebar = ({ chats, currentUserId }: ChatSidebarProps) => {
  return (
    <div className="flex flex-col gap-2 p-2 max-w-[250px] bg-slate-600 h-screen overflow-auto">
      {chats.map((chat) => {
        const otherUser =
          chat.participant_1_id === currentUserId
            ? chat.participant_2
            : chat.participant_1;

        return (
          <ChatSidebarItem
            key={chat.id}
            chatId={chat.id}
            firstName={otherUser?.first_name}
            lastName={otherUser?.last_name}
          />
        );
      })}
    </div>
  );
};

export default ChatSidebar;
