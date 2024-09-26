import { useState, useEffect } from "react";
import { Message } from "src/types/Message.types";
import { supabase } from "src/utils/supabase/component";

const useChatMessages = (
  chatId: string | undefined,
  groupId: string | undefined,
  userId: string,
  sendPushNotification: (message: Message) => void
) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!groupId && chatId) {
      const fetchChatMessages = async () => {
        const { data: messagesData, error } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true });

        if (!error) setMessages(messagesData);
      };

      fetchChatMessages();
    }

    if (!chatId && groupId) {
      const fetchGroupMessages = async () => {
        const { data: messagesData, error } = await supabase
          .from("messages")
          .select("*")
          .eq("room_id", groupId)
          .order("created_at", { ascending: true });

        if (!error) setMessages(messagesData);
      };
      fetchGroupMessages();
    }
  }, [chatId, supabase]);

  useEffect(() => {
    const chatChannel = supabase
      .channel(`public:messages:chat_id=eq.${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(
            (prevMessages) => [...prevMessages, newMessage] as Message[]
          );
          if (newMessage.sender_id !== userId) sendPushNotification(newMessage);
        }
      )
      .subscribe();

    const groupChannel = supabase
      .channel(`public:messages:room_id=eq.${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${groupId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(
            (prevMessages) => [...prevMessages, newMessage] as Message[]
          );
          if (newMessage.sender_id !== userId) sendPushNotification(newMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(groupChannel);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  return messages;
};

export default useChatMessages;
