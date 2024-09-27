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
import useTypingStatus from "src/hooks/useTypingStatus";
import ImageUpload from "../ImageUpload";
import { Room } from "src/types/Room.types";
import { getCurrentSenderName } from "src/utils/getCurrentSenderName";

interface ActiveChatProps {
  chat?: Chat | null;
  room?: Room;
  userId: string;
  onSidebarToggle: () => void;
}

const ActiveChat = ({
  chat,
  room,
  userId,
  onSidebarToggle,
}: ActiveChatProps) => {
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { firstName, lastName } = determineUserName({ chat, userId });
  const { sendPushNotification, notificationSoundRef } = usePushNotifications(
    firstName,
    lastName,
    room?.name
  );
  const messages = useChatMessages(
    chat?.id,
    room?.id,
    userId,
    sendPushNotification
  );
  const { typingUsers } = useTypingStatus(chat?.id, userId, messageInputRef);

  useUserStatus(userId);

  const otherUserId =
    chat?.participant_1_id === userId
      ? chat?.participant_2_id
      : chat?.participant_1_id;

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async (
    event: React.FormEvent,
    imageUrl?: string
  ) => {
    event.preventDefault();

    if (imageUrl) {
      await supabase.from("messages").insert([
        {
          chat_id: chat?.id,
          room_id: room?.id,
          sender_id: userId,
          content: "",
          image_url: imageUrl || "",
        },
      ]);
    }

    if (!message || !message.trim()) {
      setMessage("");
      return;
    }

    const { error: sendMessageError } = await supabase.from("messages").insert([
      {
        chat_id: chat?.id,
        room_id: room?.id,
        sender_id: userId,
        content: message,
        image_url: imageUrl || "",
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

  const filteredRoomParticipants = room?.room_participants.filter(
    (roomParticipant) => {
      const isCurrentUser = roomParticipant.user_id === userId;

      return !isCurrentUser;
    }
  );

  const participantsNames = filteredRoomParticipants?.map(
    (roomParticipant, index) => {
      if (room) {
        const isLastParticipant = index === filteredRoomParticipants.length - 1;

        // If the chat is a group chat, return the first and last name of the participants
        return `${roomParticipant.users.first_name} ${
          roomParticipant.users.last_name
        }${isLastParticipant ? "" : ", "}`;
      }
    }
  );

  return (
    <div className="p-2 bg-slate-600 w-full flex flex-col gap-1 h-screen relative">
      <Button
        className="absolute left-[10px] top-[15px] md:hidden"
        icon={<MdKeyboardArrowRight className="w-8 h-8" />}
        onClick={onSidebarToggle}
      />
      <div className="text-lg bg-slate-500 p-2 rounded-sm text-center md:text-left">
        <span className="relative">
          Chat with {participantsNames || `${firstName} ${lastName}`}
          {chat ? <OtherUserStatus otherUserId={otherUserId} /> : null}
        </span>
      </div>
      <div className="bg-slate-500 rounded-sm h-full flex flex-col gap-4 overflow-y-auto pt-8 px-3 pb-4">
        {messages.length > 0 ? (
          messages.map((message) => {
            const isOtherUser = message.sender_id !== userId;
            const senderName =
              message.sender_id === userId ? "You" : `${firstName} ${lastName}`;

            let nameOfUser = "";

            if (room) {
              nameOfUser =
                message.sender_id === userId
                  ? "You"
                  : getCurrentSenderName(
                      message.sender_id,
                      filteredRoomParticipants
                    );
            }

            if (chat) {
              nameOfUser = senderName;
            }
            return (
              <ChatItem
                key={message.id}
                content={message.content}
                senderName={nameOfUser}
                isOtherUser={isOtherUser}
                imageUrl={message.image_url}
                createdAt={message.created_at}
              />
            );
          })
        ) : (
          <div className="p-2 rounded-sm  my-1">No messages yet</div>
        )}
        <div className="relative w-full h-[10px] mt-auto">
          {typingUsers.length > 0 ? (
            <span className="absolute text-xs text-center w-full">
              {firstName} is typing
            </span>
          ) : null}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div className="flex w-full justify-center items-center">
        <ImageUpload
          onUpload={(event: any, url: string) => handleSendMessage(event, url)}
        />
        <form
          className="bg-slate-500 rounded-sm flex gap-1 w-full"
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
      </div>
      <audio ref={notificationSoundRef} src="/sounds/notification.mp3" />
    </div>
  );
};

export default ActiveChat;
