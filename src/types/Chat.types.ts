export type Chat = {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  participant_1?: {
    first_name: string;
    last_name: string;
    profile_photo: string;
  };
  participant_2?: {
    first_name: string;
    last_name: string;
    profile_photo: string;
  };
  created_at: string;
};
