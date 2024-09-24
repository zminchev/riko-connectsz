import React, { useRef, useState } from "react";
import Input from "../Input";
import { IoSend } from "react-icons/io5";
import Button from "../Button";
import { Chat } from "src/types/Chat.types";
import { determineUserName } from "src/utils/determineUserName";

interface ActiveChatProps {
  chat: Chat;
  userId: string;
}

const ActiveChat = ({ chat, userId }: ActiveChatProps) => {
  const [message, setMessage] = useState("");
  const messageInputRef = useRef<HTMLInputElement>(null);
  const { firstName, lastName } = determineUserName({ chat, userId });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    setMessage("");
    messageInputRef.current?.focus();
  };

  return (
    <div className="p-2 bg-slate-600 ml-1 w-full flex flex-col gap-1">
      <span className="text-lg bg-slate-500 p-2 rounded-sm">
        Chat with {firstName} {lastName}
      </span>
      <div className="bg-slate-500 rounded-sm h-full">content</div>
      <div className="bg-slate-500 rounded-sm flex gap-1">
        <Input
          ref={messageInputRef}
          id="messsage"
          type="text"
          className="w-full"
          placeholder="Type a message..."
          value={message}
          onChange={handleOnChange}
        />
        <Button
          type="button"
          className="p-3 rounded-sm ml-1"
          icon={<IoSend />}
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ActiveChat;
