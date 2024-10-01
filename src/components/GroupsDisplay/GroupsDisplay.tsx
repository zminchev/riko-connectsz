import React from 'react';
import { Group } from 'src/types/Group.types';
import ChatSidebarItem from '../ChatSidebar/ChatSidebarItem';

const GroupsDisplay = ({ groups }: { groups: Group[] }) => {
  return (
    groups.length > 0 &&
    groups.map((group) => {
      console.log(group);
      
      return (
        <ChatSidebarItem
          key={group.id}
          groupId={group.id}
          groupName={group.name}
          groupPhoto={group.room_photo}
        />
      );
    })
  );
};

export default GroupsDisplay;
