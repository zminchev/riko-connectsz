import { useEffect, useState } from 'react';
import { createClient } from 'src/utils/supabase/component';

const useTypingStatus = (
  chatId: string | undefined,
  userId: string,
  inputRef: React.RefObject<HTMLInputElement>,
) => {
  const supabase = createClient();
  const [typingUsers, setTypingUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!inputRef.current) return;
    const inputElement = inputRef.current;

    // Create a real-time channel for the chat room with presence enabled
    const channel = supabase.channel(`chat_room:${chatId}`, {
      config: {
        presence: {
          key: userId, // Presence requires string keys
        },
      },
    });

    // Function to update presence data
    const updatePresence = (isTyping: boolean) => {
      channel.track({ isTyping });
    };

    // Handle typing events
    let typingTimeout: NodeJS.Timeout;
    const handleTyping = () => {
      // Update presence to isTyping: true
      updatePresence(true);

      // Clear existing timeout
      if (typingTimeout) clearTimeout(typingTimeout);

      // Set timeout to reset isTyping after inactivity (e.g., 3 seconds)
      typingTimeout = setTimeout(() => {
        updatePresence(false);
      }, 200);
    };

    // Add event listener to the input element
    inputElement.addEventListener('input', handleTyping);

    // Subscribe to the channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Optionally, track initial presence data
        updatePresence(false);
      }
    });

    // Listen for presence updates
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const usersTyping = [];

      for (const [id, presences] of Object.entries(state)) {
        console.log(presences);

        if (id !== userId.toString()) {
          // Get the latest presence data
          const latestPresence = presences[presences.length - 1];
          //@ts-expect-error Expect
          if (latestPresence.isTyping) {
            usersTyping.push({ userId: id, isTyping: true });
          }
        }
      }

      setTypingUsers(usersTyping);
    });

    return () => {
      // Cleanup on unmount
      if (typingTimeout) clearTimeout(typingTimeout);
      inputElement.removeEventListener('input', handleTyping);
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, userId, inputRef]);

  return { typingUsers };
};

export default useTypingStatus;
