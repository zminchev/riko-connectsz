import React, { useEffect, useRef, useState } from 'react';
import { Chat } from 'src/types/Chat.types';
import { determineUserName } from 'src/utils/determineUserName';
import { createClient } from 'src/utils/supabase/component';
import useChatMessages from 'src/hooks/useChatMessages';
import usePushNotifications from 'src/hooks/usePushNotifications';
import useUserStatus from 'src/hooks/useUserStatus';
import useTypingStatus from 'src/hooks/useTypingStatus';
import { Group } from 'src/types/Group.types';
import ActiveChatHeader from './ActiveChatHeader';
import ActiveChatContent from './ActiveChatContent';
import ActiveChatInput from './ActiveChatInput';
import { getUserLettersFromName } from 'src/utils/getUserLettersFromName';

interface ActiveChatProps {
  chat?: Chat | null;
  room?: Group;
  userId: string;
}

const ActiveChat = ({ chat, room, userId }: ActiveChatProps) => {
  const supabase = createClient();
  const [message, setMessage] = useState('');
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { firstName, lastName, profilePhoto } = determineUserName({ chat, userId });
  const { sendPushNotification, notificationSoundRef } = usePushNotifications(
    firstName,
    lastName,
    room?.name,
  );
  const messages = useChatMessages(
    chat?.id,
    room?.id,
    userId,
    sendPushNotification,
  );
  const { typingUsers } = useTypingStatus(chat?.id, userId, messageInputRef);

  useUserStatus(userId);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async (
    event: React.FormEvent,
    imageUrl?: string,
  ) => {
    event.preventDefault();

    if (imageUrl) {
      await supabase.from('messages').insert([
        {
          chat_id: chat?.id,
          room_id: room?.id,
          sender_id: userId,
          content: '',
          image_url: imageUrl || '',
        },
      ]);
    }

    if (!message || !message.trim()) {
      setMessage('');
      return;
    }

    const { error: sendMessageError } = await supabase.from('messages').insert([
      {
        chat_id: chat?.id,
        room_id: room?.id,
        sender_id: userId,
        content: message,
        image_url: imageUrl || '',
      },
    ]);

    if (sendMessageError) {
      console.error(sendMessageError);
    }

    setMessage('');
    messageInputRef.current?.focus();
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const participantsNames = room?.room_participants
    ?.map((roomParticipant, index) => {
      if (room) {
        const isLastParticipant = index === room?.room_participants.length - 1;
        const firstName = roomParticipant.users.first_name;
        const lastName = roomParticipant.users.last_name;

        return isLastParticipant
          ? `${firstName} ${lastName}`
          : `${firstName} ${lastName}`;
      }
    })
    .filter(Boolean)
    .join(', ');

  const participantsWithPhotos = room?.room_participants?.map((participant) => {
    const userPhoto = participant.users.profile_photo;

    const userInitials = getUserLettersFromName({
      firstName: participant.users.first_name,
      lastName: participant.users.last_name,
    }).fallbackName;

    return {
      userId: participant.user_id,
      userPhoto,
      userInitials,
      firstName: participant.users.first_name,
      lastName: participant.users.last_name,
    };
  });

  return (
    <div className="bg-white w-full flex flex-col h-screen relative gap-4 px-2">
      <ActiveChatHeader
        firstName={firstName}
        lastName={lastName}
        participantsNames={participantsNames}
        groupName={room?.name}
        userPhoto={profilePhoto}
      />
      <ActiveChatContent
        messages={messages}
        group={room}
        chat={chat}
        userId={userId}
        firstName={firstName}
        lastName={lastName}
        filteredGroupParticipants={participantsWithPhotos}
        messagesEndRef={messagesEndRef}
      />
      {/* <div className="relative w-full h-[10px] mt-auto">
        {typingUsers.length > 0 ? (
          <span className="absolute text-xs text-center w-full text-black">
            {firstName} is typing
          </span>
        ) : null}
      </div> */}
      <ActiveChatInput
        handleSendMessage={handleSendMessage}
        handleInputChange={handleOnChange}
        message={message}
        inputRef={messageInputRef}
      />
      <audio ref={notificationSoundRef} src="/sounds/notification.mp3" />
    </div>
  );
};

export default ActiveChat;
