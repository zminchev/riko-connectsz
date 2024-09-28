import React, { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextProps {
  activeModal: string | null;
  isModalOpen: (modalId: string) => boolean;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const isModalOpen = (modalId: string) => {
    return activeModal === modalId;
  };

  return (
    <ModalContext.Provider
      value={{ activeModal, openModal, closeModal, isModalOpen }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
