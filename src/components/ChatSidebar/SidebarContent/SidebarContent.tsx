import React from 'react';
import Card from 'src/components/Card';
import { Chat } from 'src/types/Chat.types';
import { Group } from 'src/types/Group.types';
import ChatsDisplay from 'src/components/ChatsDisplay';
import GroupsDisplay from 'src/components/GroupsDisplay';
import Button from 'src/components/Button';
import { IoMdSettings, IoMdAddCircle, IoMdExit } from 'react-icons/io';
import Modal from 'src/components/ModalPortal/ModalPortal';
import { useModal } from 'src/context/ModalContext';
import GroupCreationContainer from 'src/components/GroupCreationContainer';
import { useRouter } from 'next/router';

const SidebarContent = ({
  chats = [],
  groups = [],
  currentUserId,
  onLogout,
}: {
  chats?: Chat[];
  groups?: Group[];
  currentUserId: string;
  onLogout: () => void;
}) => {
  const { isModalOpen, openModal, closeModal } = useModal();
  const router = useRouter();

  const filteredChats = chats.filter(
    (chat) =>
      chat.participant_1_id === currentUserId ||
      chat.participant_2_id === currentUserId,
  );

  return (
    <>
      <Modal isOpen={isModalOpen('create-group')} onClose={closeModal}>
        <GroupCreationContainer />
      </Modal>
      <div className="inset-y-0 bg-white pt-2 pb-4 px-2 w-96 h-screen overflow-y-auto">
        <Card className="pt-2 flex flex-col gap-1 h-full">
          {chats.length > 0 && (
            <ChatsDisplay chats={filteredChats} currentUserId={currentUserId} />
          )}
          {groups.length > 0 && <GroupsDisplay groups={groups} />}
        </Card>
      </div>
      <div className="inset-y-0 bg-white p-2 w-96">
        <Card className="p-3 flex justify-between items-center">
          <Button
            icon={<IoMdExit className="w-6 h-6" />}
            className="text-black hover:text-error-primary p-2 transition-colors duration-150"
            onClick={onLogout}
          />
          {router.route === '/groups' && (
            <Button
              icon={
                <IoMdAddCircle className="w-6 h-6 text-black hover:text-cyan-500 transition-colors duration-150" />
              }
              onClick={() => openModal('create-group')}
            />
          )}
          <Button
            icon={<IoMdSettings className="w-6 h-6" />}
            className="text-black p-2 hover:text-cyan-500 transition-colors duration-150"
          />
        </Card>
      </div>
    </>
  );
};

export default SidebarContent;
