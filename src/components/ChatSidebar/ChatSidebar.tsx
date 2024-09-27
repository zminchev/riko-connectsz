import React, { useEffect, useState } from "react";
import { Chat } from "src/types/Chat.types";
import ChatSidebarItem from "./ChatSidebarItem";
import { determineUserName } from "src/utils/determineUserName";
import { createClient } from "src/utils/supabase/component";
import { IoClose } from "react-icons/io5";
import Button from "../Button";
import { useRouter } from "next/router";
import { Room } from "src/types/Room.types";
import { IoIosSettings } from "react-icons/io";
import GroupCreationContainer from "../GroupCreationContainer";
import Modal from "../ModalPortal/ModalPortal";
interface ChatSidebarProps {
  chats?: Chat[];
  groups?: Room[];
  currentUserId: string;
  isOpen?: boolean;
  onSidebarToggle?: () => void;
}

const ChatSidebar = ({
  chats = [],
  currentUserId,
  isOpen,
  groups = [],
  onSidebarToggle,
}: ChatSidebarProps) => {
  const supabase = createClient();
  const [allChats, setAllChats] = useState<Chat[]>(chats);
  const [allGroups, setAllGroups] = useState<Room[]>(groups);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    await supabase
      .from("users")
      .update({
        is_online: false,
      })
      .eq("id", currentUserId);

    await supabase.auth.signOut();
  };

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
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!supabase || !allChats || !allGroups) return;

    const chatsChannel = supabase
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

    const groupsChannel = supabase
      .channel("public:rooms")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
        },
        async (payload) => {
          const newGroup = payload.new as Room;

          setAllGroups((prevGroups) => [...prevGroups, newGroup] as Room[]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(chatsChannel);
      supabase.removeChannel(groupsChannel);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, supabase]);

  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <GroupCreationContainer
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
      <div
        className={`fixed inset-y-0 left-0 w-64 p-2 transform transition-transform duration-300 ease-in-out flex flex-col
        ${
          isOpen ? "translate-x-0" : "-translate-x-full pr-1"
        } md:translate-x-0 md:static md:w-64 bg-slate-600 z-40 h-screen`}
      >
        <div className="flex">
          <div className="flex flex-col gap-4 justify-center p-4 w-full">
            <Button
              text="Chats"
              className="bg-accent-primary p-2 rounded-sm text-black font-bold"
              onClick={() => router.push("/chats")}
            />
            <Button
              text="Groups"
              className="bg-accent-primary p-2 rounded-sm text-black font-bold"
              onClick={() => router.push("/groups")}
            />
          </div>
          <div className="flex items-center justify-center p-6">
            <Button
              onClick={() => setIsModalOpen(!isModalOpen)}
              icon={<IoIosSettings className="w-6 h-6" />}
            />
          </div>
        </div>
        <div className="p-2 flex justify-end md:hidden">
          <Button
            icon={<IoClose className="w-8 h-8" />}
            onClick={onSidebarToggle}
          />
        </div>
        <div className="flex flex-col gap-2 overflow-auto p-2">
          {filteredChats.length > 0 &&
            !allGroups.length &&
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
            })}
          {allGroups.length > 0 &&
            !chats.length &&
            allGroups.map((group) => {
              return (
                <ChatSidebarItem
                  key={group.id}
                  groupId={group.id}
                  groupName={group.name}
                />
              );
            })}
          {!filteredChats.length && !allGroups.length && (
            <div className="p-2 rounded-sm">
              {!filteredChats.length ? "No groups yet" : "No chats yet"}
            </div>
          )}
        </div>
        <div className="w-full p-2 mt-auto">
          <Button
            text="Log out"
            className="p-2 bg-error-primary rounded-sm w-full"
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
