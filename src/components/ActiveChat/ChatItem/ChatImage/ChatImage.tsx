import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Modal from "src/components/ModalPortal";
import { useModal } from "src/context/ModalContext";
import Image from "next/image";

interface ChatImageProps {
  isOtherUser: boolean;
  imageSrc: string;
  isImageLoading: boolean;
  senderName: string;
  lastMessageTime: string;
  handleImageLoad: () => void;
}

const ChatImage = ({
  isOtherUser,
  imageSrc,
  isImageLoading,
  senderName,
  lastMessageTime,
  handleImageLoad,
}: ChatImageProps) => {
  const { isModalOpen, openModal, closeModal } = useModal();
  const modalId = `modal-${imageSrc}`;

  return (
    <div
      className={`flex w-full relative ${
        isOtherUser ? "justify-end" : "justify-start"
      } mb-3`}
    >
      <Modal
        isOpen={isModalOpen(modalId)}
        onClose={closeModal}
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
            sizes=""
            onLoad={handleImageLoad}
            onClick={() => openModal(modalId)}
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
          onClick={() => openModal(modalId)}
          unoptimized
          priority
        />
        <span
          className={`text-xs pt-1 ${isOtherUser ? "text-right" : "text-left"}`}
        >
          {lastMessageTime}
        </span>
      </div>
    </div>
  );
};

export default ChatImage;
