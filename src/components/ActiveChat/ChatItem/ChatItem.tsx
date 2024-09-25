import React from "react";

interface ChatItemProps {
  content: string;
  senderName?: string;
  isOtherUser: boolean;
}

const ChatItem = ({ content, senderName = "", isOtherUser }: ChatItemProps) => {
  return (
    <div
      className={`flex w-full ${
        isOtherUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`p-2 rounded-md min-w-[30px] max-w-xs relative ${
          isOtherUser ? "bg-blue-700 text-right" : "bg-green-700 text-left"
        }`}
      >
        <span
          className={`absolute -top-6 text-xs ${
            isOtherUser ? "text-right right-0" : "text-left left-0"
          }`}
        >
          {senderName}
        </span>
        <span className="text-sm">{content}</span>
      </div>
    </div>
  );
};

export default ChatItem;
