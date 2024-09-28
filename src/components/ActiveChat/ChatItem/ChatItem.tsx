import React, { useState } from 'react';
import formatLastMessageTime from 'src/utils/formatLastMessageTime';
import ChatImage from './ChatImage';
import ChatMessage from './ChatMessage';

interface ChatItemProps {
  content: string;
  senderName?: string;
  isOtherUser: boolean;
  imageUrl?: string;
  userPhoto?: string;
  currentUserPhoto?: string;
  otherUserPhoto?: string;
  createdAt: string;
}

const ChatItem = ({
  content,
  senderName = '',
  userPhoto = '',
  isOtherUser,
  imageUrl = '',
  createdAt,
}: ChatItemProps) => {
  const lastMessageTime: string = formatLastMessageTime(createdAt);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const imageSrc = imageUrl || '/fallback.png';

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return imageUrl ? (
    <ChatImage
      imageSrc={imageSrc}
      isOtherUser={isOtherUser}
      isImageLoading={isImageLoading}
      lastMessageTime={lastMessageTime}
      senderName={senderName}
      handleImageLoad={handleImageLoad}
    />
  ) : (
    <ChatMessage
      isOtherUser={isOtherUser}
      senderName={senderName}
      lastMessageTime={lastMessageTime}
      content={content}
      userPhoto={userPhoto}
    />
  );
};

export default ChatItem;
