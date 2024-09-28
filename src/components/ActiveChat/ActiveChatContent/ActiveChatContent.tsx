import React from 'react';
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
}) => {
  return (
    <div className="w-full h-full bg-white text-gray-500">
      <Card className="h-full p-4 overflow-auto max-h-[733px]">
        {messages.length > 0 ? (
          messages.map((message) => {
            const isOtherUser = message.sender_id !== userId;
            const senderName =
              message.sender_id === userId ? 'You' : `${firstName} ${lastName}`;
            const userPhoto = filteredGroupParticipants?.find((participant) => {
              return participant.userId === message.sender_id;
            });

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
                userPhoto={userPhoto?.userPhoto}
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
