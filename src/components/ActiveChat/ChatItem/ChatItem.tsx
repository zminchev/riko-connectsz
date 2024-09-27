import Image from "next/image";
import React, { useState } from "react";
import Modal from "src/components/ModalPortal/ModalPortal";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import formatLastMessageTime from "src/utils/formatLastMessageTime";

interface ChatItemProps {
  content: string;
  senderName?: string;
  isOtherUser: boolean;
  imageUrl?: string;
  createdAt: string;
}

const ChatItem = ({
  content,
  senderName = "",
  isOtherUser,
  imageUrl = "",
  createdAt,
}: ChatItemProps) => {
  const lastMessageTime: string = formatLastMessageTime(createdAt);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const imageSrc = imageUrl || '/fallback.png';

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return imageUrl ? (
    <div
      className={`flex w-full relative ${
        isOtherUser ? "justify-end" : "justify-start"
      } mb-3`}
    >
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hasImage={!!imageSrc}
      >
        {isImageLoading && (
          <div className="w-full h-full flex justify-center items-center">
            <AiOutlineLoading3Quarters className="w-10 h-10 text-white animate-spin" />
          </div>
        )}
        <div className="w-full h-full relative">
          <Image
            src={imageSrc}
            alt="Modal Image"
            fill
            onLoad={handleImageLoad}
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer object-contain"
          />
        </div>
      </Modal>
      <span
        className={`absolute -top-4 text-xs ${
          isOtherUser ? "text-right right-1" : "text-left left-1"
        }`}
      >
        {senderName || ""}
      </span>
      <div className="flex flex-col">
        <Image
          src={imageSrc}
          width={200}
          height={200}
          alt="Uploaded Image"
          className="hover:cursor-pointer rounded-md"
          onClick={() => setIsModalOpen(true)}
          unoptimized
        />
        <span
          className={`text-xs pt-1 ${isOtherUser ? "text-right" : "text-left"}`}
        >
          {lastMessageTime}
        </span>
      </div>
    </div>
  ) : (
    <div
      className={`flex w-full relative ${
        isOtherUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <span
        className={`absolute -top-4 text-xs ${
          isOtherUser ? "text-right right-1" : "text-left left-1"
        }`}
      >
        {senderName || ""}
      </span>
      <div className="flex flex-col">
        <div
          className={`px-2 py-1 max-w-xs relative text-message-text shadow-md text-left ${
            isOtherUser
              ? "bg-other-user rounded-t-md rounded-bl-md"
              : "bg-current-user rounded-t-md rounded-br-md"
          }`}
        >
          <span className="text-sm break-words whitespace-normal">
            {content}
          </span>
        </div>
        <span
          className={`text-xs pt-1 ${isOtherUser ? "text-right" : "text-left"}`}
        >
          {lastMessageTime}
        </span>
      </div>
    </div>
  );
};

export default ChatItem;
