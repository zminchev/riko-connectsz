import React, { useEffect, useState } from 'react';
import { Chat } from 'src/types/Chat.types';
import { createClient } from 'src/utils/supabase/component';
import { useRouter } from 'next/router';
import { Group } from 'src/types/Group.types';
import SidebarHeader from './SidebarHeader';
import SidebarContent from './SidebarContent';

interface ChatSidebarProps {
  chats?: Chat[];
  groups?: Group[];
  currentUserId: string;
  activeGroup?: Group;
  isOpen?: boolean;
  onSidebarToggle?: () => void;
}

const ChatSidebar = ({
  chats = [],
  currentUserId,
  groups = [],
  activeGroup,
}: ChatSidebarProps) => {
  const supabase = createClient();
  const [allChats, setAllChats] = useState<Chat[]>(chats);
  const [allGroups, setAllGroups] = useState<Group[]>(groups);

  const router = useRouter();

  const handleLogout = async () => {
    await supabase
      .from('users')
      .update({
        is_online: false,
      })
      .eq('id', currentUserId);

    await supabase.auth.signOut();
  };

  const filteredChats = allChats.filter(
    (chat) =>
      chat.participant_1_id === currentUserId ||
      chat.participant_2_id === currentUserId,
  );

  const fetchParticipantDetails = async (chat: Chat) => {
    const { data: enrichedChat, error } = await supabase
      .from('chats')
      .select(
        `
        id,
        participant_1_id,
        participant_2_id,
        created_at,
        participant_1:participant_1_id ( first_name, last_name ),
        participant_2:participant_2_id ( first_name, last_name )
        `,
      )
      .eq('id', chat.id)
      .single();

    if (error) {
      console.error('Error fetching chat with participant details:', error);
    }

    return enrichedChat;
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
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
      .channel('public:chats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
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
                (prevChats) => [...prevChats, enrichedChat] as Chat[],
              );
            }
          }
        },
      )
      .subscribe();

    const groupsChannel = supabase
      .channel('public:rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        async (payload) => {
          const newGroup = payload.new as Group;

          setAllGroups((prevGroups) => [...prevGroups, newGroup] as Group[]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(chatsChannel);
      supabase.removeChannel(groupsChannel);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, supabase]);

  return (
    <div className={`flex flex-col h-screen`}>
      <SidebarHeader />
      <SidebarContent
        chats={filteredChats}
        groups={allGroups}
        currentUserId={currentUserId}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default ChatSidebar;
