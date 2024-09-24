import { Chat } from "src/types/Chat.types";

interface DetermineUserNameProps {
  chat: Chat;
  userId: string;
}
export const determineUserName = ({ chat, userId }: DetermineUserNameProps) => {
  const otherUser =
    chat.participant_1_id === userId ? chat.participant_2 : chat.participant_1;

  const firstName = otherUser?.first_name;
  const lastName = otherUser?.last_name;

  return {
    firstName,
    lastName,
  };
};
