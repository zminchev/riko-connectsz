import React from "react";

interface ChatItemProps {
  content: string;
  senderName?: string;
  isOtherUser: boolean;
}

const ChatItem = ({ content, senderName = "", isOtherUser }: ChatItemProps) => {
  return (
    <div
      className={`flex w-full relative ${
        isOtherUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <span
        className={`absolute -top-6 text-xs ${
          isOtherUser ? "text-right right-1" : "text-left left-1"
        }`}
      >
        {senderName}
      </span>
      <div
        className={`p-2 rounded-md  max-w-xs relative ${
          isOtherUser ? "bg-blue-700 text-right" : "bg-green-700 text-left"
        }`}
      >
        <span className="text-sm">{content}</span>
      </div>
    </div>
  );
};

export default ChatItem;
