import React, { useEffect, useRef, useState } from "react";
import Input from "../Input";
import { IoSend } from "react-icons/io5";
import Button from "../Button";
import { Chat } from "src/types/Chat.types";
import { determineUserName } from "src/utils/determineUserName";
import { createClient } from "src/utils/supabase/component";
import { Message } from "src/types/Message.types";
import ChatItem from "./ChatItem";

interface ActiveChatProps {
  chat: Chat;
  userId: string;
}

const ActiveChat = ({ chat, userId }: ActiveChatProps) => {
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const [lastSoundPlayed, setLastSoundPlayed] = useState<number>(0);
  const { firstName, lastName } = determineUserName({ chat, userId });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message || message.trim() === "") {
      return;
    }

    const { error: sendMessageError } = await supabase.from("messages").insert([
      {
        chat_id: chat.id,
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

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chat.id)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return;
      }

      setMessages(messagesData);
    };

    fetchMessages();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!supabase || !chat) return;

    const channel = supabase
      .channel(`public:messages:chat_id=eq.${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => {
          setMessages(
            (prevMessages) => [...prevMessages, payload.new] as Message[]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat, supabase]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    const now = Date.now();
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isOtherUser = lastMessage.sender_id !== userId;

      if (isOtherUser && now - lastSoundPlayed > 3000) {
        // 3000ms = 3 seconds delay
        notificationSoundRef.current?.play();
        setLastSoundPlayed(now);
      }
    }
  }, [messages, userId, lastSoundPlayed]);

  return (
    <div className="p-2 bg-slate-600 ml-1 w-full flex flex-col gap-1 h-screen">
      <span className="text-lg bg-slate-500 p-2 rounded-sm">
        Chat with {firstName} {lastName}
      </span>
      <div className="bg-slate-500 rounded-sm h-full flex flex-col gap-4 overflow-y-auto pt-8 px-3">
        {messages.length > 0 ? (
          messages.map((message) => {
            const senderName = message.sender_id === userId ? "You" : firstName;
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
