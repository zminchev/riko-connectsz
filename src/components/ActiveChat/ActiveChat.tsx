import React, { useEffect, useRef, useState } from "react";
import Input from "../Input";
import { IoSend } from "react-icons/io5";
import Button from "../Button";
import { Chat } from "src/types/Chat.types";
import { determineUserName } from "src/utils/determineUserName";
import { createClient } from "src/utils/supabase/component";
import ChatItem from "./ChatItem";
import { MdKeyboardArrowRight } from "react-icons/md";
import useChatMessages from "src/hooks/useChatMessages";
import usePushNotifications from "src/hooks/usePushNotifications";
import useUserStatus from "src/hooks/useUserStatus";
import OtherUserStatus from "../OtherUserStatus";

interface ActiveChatProps {
  chat: Chat;
  userId: string;
  onSidebarToggle: () => void;
}

const ActiveChat = ({ chat, userId, onSidebarToggle }: ActiveChatProps) => {
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { firstName, lastName } = determineUserName({ chat, userId });
  const { sendPushNotification, notificationSoundRef } = usePushNotifications(
    firstName,
    lastName
  );
  const messages = useChatMessages(chat.id, userId, sendPushNotification);
  useUserStatus(userId);

  const otherUserId =
    chat.participant_1_id === userId
      ? chat.participant_2_id
      : chat.participant_1_id;

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message || !message.trim()) {
      setMessage("");
      return;
    }

    const { error: sendMessageError } = await supabase.from("messages").insert([
      {
        chat_id: chat?.id,
        sender_id: userId,
        content: message,
      },
    ]);

    if (sendMessageError) {
      console.error(sendMessageError);
    }

    setMessage("");
    messageInputRef.current?.focus();
  };

  // Scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="p-2 bg-slate-600 w-full flex flex-col gap-1 h-screen relative">
      <Button
        className="absolute left-[10px] top-[15px] md:hidden"
        icon={<MdKeyboardArrowRight className="w-8 h-8" />}
        onClick={onSidebarToggle}
      />
      <div className="text-lg bg-slate-500 p-2 rounded-sm text-center md:text-left">
        <span className="relative">
          Chat with {firstName} {lastName}
          <OtherUserStatus otherUserId={otherUserId} />
        </span>
      </div>
      <div className="bg-slate-500 rounded-sm h-full flex flex-col gap-4 overflow-y-auto pt-8 px-3">
        {messages.length > 0 ? (
          messages.map((message) => {
            const senderName =
              message.sender_id === userId ? "You" : `${firstName} ${lastName}`;
            const isOtherUser = message.sender_id !== userId;

            return (
              <ChatItem
                key={message.id}
                content={message.content}
                senderName={senderName}
                isOtherUser={isOtherUser}
              />
            );
          })
        ) : (
          <div className="p-2 rounded-sm  my-1">No messages yet</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="bg-slate-500 rounded-sm flex gap-1"
        onSubmit={(e) => handleSendMessage(e)}
      >
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
          type="submit"
          className="p-3 rounded-sm ml-1"
          icon={<IoSend />}
        />
      </form>
      <audio ref={notificationSoundRef} src="/sounds/notification.mp3" />
    </div>
  );
};

export default ActiveChat;
