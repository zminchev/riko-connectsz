import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  hasImage?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  hasImage = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center text-dark-primary p-12">
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 backdrop-blur blur-md ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`rounded-lg p-1 z-10 w-full transform transition-transform duration-300 ease-out  ${
          !hasImage ? "max-w-lg bg-accent-secondary" : "h-full"
        } ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <button
          className={`absolute -top-10 text-white hover:bg-gray-200/10 rounded-full transition-colors duration-300 ${
            !hasImage ? "p-1 -top-11 right-0" : "p-2 -right-10"
          }`}
          onClick={onClose}
        >
          <IoClose className="w-8 h-8" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
