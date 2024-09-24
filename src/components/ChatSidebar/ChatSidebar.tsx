import React, { useEffect, useState } from "react";
import { Chat } from "src/types/Chat.types";
import ChatSidebarItem from "./ChatSidebarItem";
import { determineUserName } from "src/utils/determineUserName";
import { createClient } from "src/utils/supabase/component";
interface ChatSidebarProps {
  chats: Chat[];
  currentUserId: string;
}

const ChatSidebar = ({ chats, currentUserId }: ChatSidebarProps) => {
  const [allChats, setAllChats] = useState<Chat[]>(chats);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase || !allChats) return;

    const channel = supabase
      .channel("public:chats")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setAllChats((prevChats) => [...prevChats, payload.new] as Chat[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chats, supabase]);

  return (
    <div className="flex flex-col gap-2 p-2 max-w-[250px] min-w-[250px] bg-slate-600 h-screen overflow-auto rounded-sm">
      {chats.length > 0 ? (
        chats.map((chat) => {
          const { firstName, lastName } = determineUserName({
            chat,
            userId: currentUserId,
          });

          return (
            <ChatSidebarItem
              key={chat.id}
              chatId={chat.id}
              firstName={firstName}
              lastName={lastName}
            />
          );
        })
      ) : (
        <div className="p-2 rounded-sm">No chats yet</div>
      )}
    </div>
  );
};

export default ChatSidebar;
