import React, { useEffect, useState } from "react";
import { Chat } from "src/types/Chat.types";
import ChatSidebarItem from "./ChatSidebarItem";
import { determineUserName } from "src/utils/determineUserName";
import { createClient } from "src/utils/supabase/component";
import { IoClose } from "react-icons/io5";
import Button from "../Button";
interface ChatSidebarProps {
  chats: Chat[];
  currentUserId: string;
  isOpen: boolean;
  onSidebarToggle: () => void;
}

const ChatSidebar = ({
  chats,
  currentUserId,
  isOpen,
  onSidebarToggle,
}: ChatSidebarProps) => {
  const [allChats, setAllChats] = useState<Chat[]>(chats);
  const supabase = createClient();

  const filteredChats = allChats.filter(
    (chat) =>
      chat.participant_1_id === currentUserId ||
      chat.participant_2_id === currentUserId
  );

  const fetchParticipantDetails = async (chat: Chat) => {
    const { data: enrichedChat, error } = await supabase
      .from("chats")
      .select(
        `
        id,
        participant_1_id,
        participant_2_id,
        created_at,
        participant_1:participant_1_id ( first_name, last_name ),
        participant_2:participant_2_id ( first_name, last_name )
        `
      )
      .eq("id", chat.id)
      .single();

    if (error) {
      console.error("Error fetching chat with participant details:", error);
    }

    return enrichedChat;
  };

  useEffect(() => {
    if (!supabase || !allChats) return;

    const channel = supabase
      .channel("public:chats")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
        },
        async (payload) => {
          const newChat = payload.new as Chat;

          if (
            newChat.participant_1_id === currentUserId ||
            newChat.participant_2_id === currentUserId
          ) {
            const enrichedChat = await fetchParticipantDetails(newChat);

            if (!allChats.some((chat) => chat.id === enrichedChat?.id)) {
              setAllChats(
                (prevChats) => [...prevChats, enrichedChat] as Chat[]
              );
            }
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, supabase]);

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 p-2 transform transition-transform duration-300 ease-in-out
      ${
        isOpen ? "translate-x-0" : "-translate-x-full pr-1"
      } md:translate-x-0 md:static md:w-64 bg-slate-600 z-40 h-screen`}
    >
      <div className="p-2 flex justify-end md:hidden">
        <Button
          icon={<IoClose className="w-8 h-8" />}
          onClick={onSidebarToggle}
        />
      </div>
      {filteredChats.length > 0 ? (
        filteredChats.map((chat) => {
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
