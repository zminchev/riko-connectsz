export interface Group {
  id: string;
  name: string;
  created_at: string;
  room_participants: {
    user_id: string;
    users: {
      first_name: string;
      last_name: string;
    };
  }[];
}

export interface RoomParticipant {
  user_id: string;
  room_id: string;
  joined_at: string;
}
