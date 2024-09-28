import { Chat } from "src/types/Chat.types";
import { Group } from "src/types/Group.types";

interface DetermineUserNameProps {
  chat?: Chat | null;
  room?: Group;
  userId: string;
}
export const determineUserName = ({
  chat,
  room,
  userId,
}: DetermineUserNameProps) => {
  const otherUser =
    chat?.participant_1_id === userId
      ? chat.participant_2
      : chat?.participant_1;

  const firstName = otherUser?.first_name;
  const lastName = otherUser?.last_name;
  const profilePhoto = otherUser?.profile_photo;

  const groupName = room?.name; //TODO Change to group

  return {
    firstName,
    lastName,
    profilePhoto,
    groupName,
  };
};
