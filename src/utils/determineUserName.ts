import { Chat } from "src/types/Chat.types";
import { Room } from "src/types/Room.types";

interface DetermineUserNameProps {
  chat?: Chat | null;
  room?: Room;
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
  const roomName = room?.name;

  return {
    firstName,
    lastName,
    roomName,
  };
};
