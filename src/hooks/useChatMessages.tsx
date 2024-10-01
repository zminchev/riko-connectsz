import { debounce } from 'lodash';
import { useState, useEffect } from 'react';
import { Message } from 'src/types/Message.types';
import { createClient } from 'src/utils/supabase/component';

const LIMIT = 50;

const useChatMessages = (
  chatId: string | undefined,
  groupId: string | undefined,
  userId: string,
  sendPushNotification: (message: Message) => void,
  containerRef: React.RefObject<HTMLDivElement>,
) => {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchMoreChatMessages = async () => {
    setIsLoading(true);

    const { data: newMessages, error } = await supabase
      .from('messages')
      .select('*')
      .range(offset, offset + LIMIT)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching more messages: ', error);
      return;
    }

    const reversedMessages = newMessages?.reverse() as Message[];

    const uniqueMessages = reversedMessages.filter((newMessage) => {
      return !messages.some(
        (existingMessage) => existingMessage.id === newMessage.id,
      );
    });

    setIsLoading(false);
    setMessages([...uniqueMessages, ...messages]);
    setOffset(offset + LIMIT);

    if (containerRef.current) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const currentScrollHeight = containerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - currentScrollHeight;

      containerRef.current.scrollTop += scrollDiff + 10;
    }
  };

  const handleScroll = debounce(() => {
    if (containerRef.current) {
      if (containerRef.current.scrollTop === 0) {
        fetchMoreChatMessages();
      }
    }
  }, 400);

  useEffect(() => {
    if (!groupId && chatId) {
      const fetchChatMessages = async () => {
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching initial messages: ', error);
          return;
        }

        const reversedMessages = messagesData?.reverse() as Message[];

        setMessages(reversedMessages);
      };

      fetchChatMessages();
    }

    if (!chatId && groupId) {
      const fetchGroupMessages = async () => {
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', groupId)
          .order('created_at', { ascending: true });

        if (!error) setMessages(messagesData);
      };
      fetchGroupMessages();
    }
  }, [chatId, groupId, supabase]);

  useEffect(() => {
    const chatChannel = supabase
      .channel(`public:messages:chat_id=eq.${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(
            (prevMessages) => [...prevMessages, newMessage] as Message[],
          );
          if (newMessage.sender_id !== userId) sendPushNotification(newMessage);
        },
      )
      .subscribe();

    const groupChannel = supabase
      .channel(`public:messages:room_id=eq.${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${groupId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(
            (prevMessages) => [...prevMessages, newMessage] as Message[],
          );
          if (newMessage.sender_id !== userId) sendPushNotification(newMessage);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(groupChannel);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, groupId]);

  return { messages, handleScroll, isLoading };
};

export default useChatMessages;
