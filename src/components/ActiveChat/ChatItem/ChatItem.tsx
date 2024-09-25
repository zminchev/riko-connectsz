import Image from "next/image";
import React from "react";

interface ChatItemProps {
  content: string;
  senderName?: string;
  isOtherUser: boolean;
  imageUrl?: string;
}

const ChatItem = ({
  content,
  senderName = "",
  isOtherUser,
  imageUrl = "",
}: ChatItemProps) => {
  return imageUrl ? (
    <div className="max-w-80">
      <Image src={imageUrl} width={200} height={200} alt="Uploaded Imagе" />
    </div>
  ) : (
    <div
      className={`flex w-full relative ${
        isOtherUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <span
        className={`absolute -top-4 text-xs ${
          isOtherUser ? "text-right right-1" : "text-left left-1"
        }`}
      >
        {senderName || ""}
      </span>
      <div
        className={`px-2 py-1 max-w-xs relative text-message-text shadow-md text-left ${
          isOtherUser
            ? "bg-other-user rounded-t-md rounded-bl-md"
            : "bg-current-user rounded-t-md rounded-br-md"
        }`}
      >
        <span className="text-sm break-words whitespace-normal">{content}</span>
      </div>
    </div>
  );
};

export default ChatItem;
