import { useState, useEffect } from "react";
import { Message } from "src/types/Message.types";
import { createClient } from "src/utils/supabase/component";

const useChatMessages = (
  chatId: string,
  userId: string,
  sendPushNotification: (message: Message) => void
) => {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (!error) setMessages(messagesData);
    };

    fetchMessages();
  }, [chatId, supabase]);

  useEffect(() => {
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, supabase]);

  return messages;
};

export default useChatMessages;
