import React, { useEffect, useState } from 'react';
import Card from 'src/components/Card';
import { Chat } from 'src/types/Chat.types';
import { Group } from 'src/types/Group.types';
import { Message } from 'src/types/Message.types';
import { getCurrentSenderName } from 'src/utils/getCurrentSenderName';
import ChatItem from '../ChatItem';

const ActiveChatContent = ({
  messages,
  userId,
  firstName,
  lastName,
  group,
  chat,
  filteredGroupParticipants,
  messagesEndRef,
  containerRef,
  onScroll,
  isLoading,
}: {
  messages: Message[];
  userId: string;
  firstName?: string;
  lastName?: string;
  group?: Group;
  chat?: Chat | null;
  filteredGroupParticipants?: {
    userId: string;
    userPhoto: string;
    firstName: string;
    lastName: string;
    userInitials: string;
  }[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
  isLoading?: boolean;
}) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [prevMessageCount, setPrevMessageCount] = useState(0);

  useEffect(() => {
    if (isInitialLoad && containerRef.current) {
      containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, containerRef]);

  useEffect(() => {
    if (containerRef.current) {
      if (prevMessageCount === 0) {
        // If it's the first load or no messages were there before
        containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
      }
    }
    setPrevMessageCount(messages.length);
  }, [messages, containerRef, prevMessageCount, chat]);
  return (
    <div className="w-full h-full bg-white text-gray-500">
      <Card
        className="h-full p-4 overflow-auto max-h-[733px]"
        containerRef={containerRef}
        onScroll={onScroll}
      >
        {isLoading && (
          <div className="p-5 text-center w-full">
            Loading previous messages...
          </div>
        )}
        {messages.length > 0 ? (
          messages.map((message) => {
            const isOtherUser = message.sender_id !== userId;

            const sender =
              message.sender_id === chat?.participant_1_id
                ? chat?.participant_1
                : chat?.participant_2;
            const userPhoto = sender?.profile_photo;

            const senderName =
              message.sender_id === userId ? 'You' : `${firstName} ${lastName}`;
            const userGroupPhoto = filteredGroupParticipants?.find(
              (participant) => {
                return participant.userId === message.sender_id;
              },
            );

            let nameOfUser = '';

            if (group) {
              nameOfUser =
                message.sender_id === userId
                  ? 'You'
                  : getCurrentSenderName(
                      message.sender_id,
                      filteredGroupParticipants,
                    );
            }

            if (chat) {
              nameOfUser = senderName;
            }

            return (
              <ChatItem
                key={message.id}
                content={message.content}
                senderName={nameOfUser}
                isOtherUser={isOtherUser}
                imageUrl={message.image_url}
                createdAt={message.created_at}
                userPhoto={chat ? userPhoto : userGroupPhoto?.userPhoto}
                audioUrl={message.audio_url}
              />
            );
          })
        ) : (
          <div className="p-2 rounded-sm  my-1">No messages yet</div>
        )}
        <div ref={messagesEndRef} />
      </Card>
    </div>
  );
};

export default ActiveChatContent;
