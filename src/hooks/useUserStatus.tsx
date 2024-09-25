import { useEffect } from "react";
import { createClient } from "src/utils/supabase/component";

const useUserStatus = (currentUserId: string) => {
  const supabase = createClient();

  useEffect(() => {
    const updateUserStatus = async (status: boolean) => {
      const date = new Date();
      const formattedDate = new Date(date).toLocaleString();
      await supabase
        .from("users")
        .update({ last_active: formattedDate, is_online: status })
        .eq("id", currentUserId);
    };

    const handleUserActivity = () => {
      updateUserStatus(true); // Set the user to online
    };

    let timeoutId: NodeJS.Timeout;

    const markAsInactive = async () => {
      await supabase
        .from("users")
        .update({ is_online: false })
        .eq("id", currentUserId);
    };

    const resetInactivityTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(markAsInactive, 5 * 60 * 1000); // 5 minutes inactivity
    };

    document.addEventListener("mousemove", handleUserActivity);
    document.addEventListener("keydown", handleUserActivity);
    document.addEventListener("mousemove", resetInactivityTimeout);
    document.addEventListener("keydown", resetInactivityTimeout);

    return () => {
      document.removeEventListener("mousemove", handleUserActivity);
      document.removeEventListener("keydown", handleUserActivity);
      document.removeEventListener("mousemove", resetInactivityTimeout);
      document.removeEventListener("keydown", resetInactivityTimeout);
    };
  }, [supabase, currentUserId]);
};

export default useUserStatus;
