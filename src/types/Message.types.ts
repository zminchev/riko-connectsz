export type Message = {
  id: number;
  chat_id: string;
  sender_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  audio_url?: string;
};
