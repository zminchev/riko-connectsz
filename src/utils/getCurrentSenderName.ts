export const getCurrentSenderName = (
  messageSenderId: string,
  filteredRoomParticipants?: {
    user_id: string;
    users: {
      first_name: string;
      last_name: string;
    };
  }[]
) => {
  const groupParticipantName = filteredRoomParticipants?.find(
    (roomParticipant) => {
      return roomParticipant.user_id === messageSenderId;
    }
  );

  const firstName = groupParticipantName?.users.first_name;
  const lastName = groupParticipantName?.users.last_name;

  const joinedNames = `${firstName} ${lastName}`;
  return joinedNames;
};
