export const getCurrentSenderName = (
  messageSenderId: string,
  filteredRoomParticipants?: {
    userId: string;
    userPhoto: string;
    firstName: string;
    lastName: string;
    userInitials: string;
  }[],
) => {
  const groupParticipantName = filteredRoomParticipants?.find(
    (roomParticipant) => {
      return roomParticipant.userId === messageSenderId;
    },
  );

  const firstName = groupParticipantName?.firstName;
  const lastName = groupParticipantName?.lastName;

  const joinedNames = `${firstName} ${lastName}`;
  return joinedNames;
};
