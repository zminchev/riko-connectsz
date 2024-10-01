import { debounce } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';
import { Message } from 'src/types/Message.types';
import { createClient } from 'src/utils/supabase/server-props';
import { createClient as createComponentClient } from 'src/utils/supabase/component';

const LIMIT = 50;

const SinkAllPage = ({ messagesData }: { messagesData: Message[] }) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [messages, setMessages] = useState<Message[]>(messagesData);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo(0, listRef.current?.scrollHeight);
    }
  }, []);

  const fetchMoreMessages = async () => {
    const supabase = createComponentClient();
    setIsLoading(true);

    const { data: newMessages, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .range(offset, offset + LIMIT)
      .eq('chat_id', '4a23b738-b62e-4885-83c9-ab3e1b01d618')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    }

    const reversedMessages = newMessages?.reverse() as Message[];

    const uniqueMessages = reversedMessages.filter(
      (newMessage) =>
        !messages.some(
          (existingMessage) => existingMessage.id === newMessage.id,
        ),
    );

    setIsLoading(false);
    setMessages([...uniqueMessages, ...messages]);
    setOffset(offset + LIMIT);

    // Calculate the difference between the new and old scroll height
    if (listRef.current) {
      const newScrollHeight = listRef.current.scrollHeight;
      const currentScrollHeight = listRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - currentScrollHeight;

      // Adjust the scroll position by the difference to maintain user's scroll position
      listRef.current.scrollTop += scrollDiff + 10;
    }
  };

  const handleScroll = debounce(() => {
    if (listRef.current) {
      if (listRef.current.scrollTop === 0) {
        fetchMoreMessages();
      }
    }
  }, 400);
  return (
    <div className="p-64 flex items-center justify-center">
      <ul
        className="w-full h-[300px] text-black border border-black overflow-auto"
        ref={listRef}
        onScroll={handleScroll}
      >
        {isLoading && <li>Is Loading More...</li>}
        {messages.map((message) => (
          <li key={message.id} className="first:border-t border-black">
            {message.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SinkAllPage;

export const getServerSideProps = async (ctx: any) => {
  const supabase = createClient({ req: ctx.req, res: ctx.res });
  const { data } = await supabase.auth.getUser();

  if (data.user?.id !== '4a23b738-b62e-4885-83c9-ab3e1b01d618') {
    return {
      redirect: {
        destination: '/chats',
        permanent: false,
      },
    };
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', '4a23b738-b62e-4885-83c9-ab3e1b01d618')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error(error);
  }

  const reversedMessages = messages?.reverse();

  return {
    props: {
      messagesData: reversedMessages || [],
    },
  };
};
