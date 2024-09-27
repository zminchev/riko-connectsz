import React from "react";
import { Chat } from "src/types/Chat.types";
import ChatSidebarItem from "../ChatSidebar/ChatSidebarItem";
import { determineUserName } from "src/utils/determineUserName";

const ChatsDisplay = ({
  chats,
  currentUserId,
}: {
  chats: Chat[];
  currentUserId: string;
}) => {
  return (
    chats.length > 0 &&
    chats.map((chat) => {
      const { firstName, lastName } = determineUserName({
        chat,
        userId: currentUserId,
      });
      return (
        <ChatSidebarItem
          key={chat.id}
          chatId={chat.id}
          firstName={firstName}
          lastName={lastName}
        />
      );
    })
  );
};

export default ChatsDisplay;
