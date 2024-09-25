import React, { useEffect, useRef, useState } from "react";
import Input from "../Input";
import { IoSend } from "react-icons/io5";
import Button from "../Button";
import { Chat } from "src/types/Chat.types";
import { determineUserName } from "src/utils/determineUserName";
import { createClient } from "src/utils/supabase/component";
import { Message } from "src/types/Message.types";
import ChatItem from "./ChatItem";
import { MdKeyboardArrowRight } from "react-icons/md";

interface ActiveChatProps {
  chat: Chat;
  userId: string;
  onSidebarToggle: () => void;
}

const ActiveChat = ({ chat, userId, onSidebarToggle }: ActiveChatProps) => {
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const [lastSoundPlayed, setLastSoundPlayed] = useState<number>(0);
  const [canPlaySound, setCanPlaySound] = useState<boolean>(false); // To track user interaction
  const [pendingSound, setPendingSound] = useState<boolean>(false); // To queue the sound
  const [isTabVisible, setIsTabVisible] = useState<boolean>(true); // Track tab visibility
  const [prevMessageCount, setPrevMessageCount] = useState<number>(0); // Track previous message count
  const { firstName, lastName } = determineUserName({ chat, userId });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message || message.trim() === "") {
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

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chat?.id)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return;
      }

      setMessages(messagesData);
    };

    fetchMessages();
  }, [chat, supabase]);

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

  // Scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    const now = Date.now();
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isOtherUser = lastMessage.sender_id !== userId;

      // Only play sound when a new message is received
      if (
        isOtherUser &&
        messages.length > prevMessageCount && // Check if a new message was received
        now - lastSoundPlayed > 3000 &&
        isTabVisible
      ) {
        if (canPlaySound) {
          notificationSoundRef.current?.play().catch((error) => {
            console.warn("Sound play prevented:", error);
          });
          setLastSoundPlayed(now);
        } else {
          // Queue the sound if user hasn't interacted yet
          setPendingSound(true);
        }
      }

      // Update previous message count
      setPrevMessageCount(messages.length);
    }
  }, [
    messages,
    userId,
    lastSoundPlayed,
    canPlaySound,
    isTabVisible,
    prevMessageCount,
  ]);

  // Play the queued sound when the user interacts
  useEffect(() => {
    if (canPlaySound && pendingSound) {
      notificationSoundRef.current?.play().catch((error) => {
        console.warn("Sound play prevented:", error);
      });
      setPendingSound(false); // Clear the pending sound after playing
      setLastSoundPlayed(Date.now()); // Update the last sound played time
    }
  }, [canPlaySound, pendingSound]);

  // Detect user interaction to enable sound playing
  useEffect(() => {
    const enableSoundOnInteraction = () => {
      setCanPlaySound(true);
      // Remove event listeners after first interaction
      document.removeEventListener("click", enableSoundOnInteraction);
      document.removeEventListener("keydown", enableSoundOnInteraction);
    };

    document.addEventListener("click", enableSoundOnInteraction);
    document.addEventListener("keydown", enableSoundOnInteraction);

    return () => {
      document.removeEventListener("click", enableSoundOnInteraction);
      document.removeEventListener("keydown", enableSoundOnInteraction);
    };
  }, []);

  // Handle page visibility change to prevent sound on refocus
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="p-2 bg-slate-600 w-full flex flex-col gap-1 h-screen relative">
      <Button
        className="absolute left-[10px] top-[15px] md:hidden"
        icon={<MdKeyboardArrowRight className="w-8 h-8" />}
        onClick={onSidebarToggle}
      />

      <span className="text-lg bg-slate-500 p-2 rounded-sm text-center md:text-left">
        Chat with {firstName} {lastName}
      </span>

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
