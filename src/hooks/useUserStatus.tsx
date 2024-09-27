import { useEffect } from "react";
import { createClient } from "src/utils/supabase/component";
import { throttle } from "lodash";

const useUserStatus = (currentUserId: string) => {
  const supabase = createClient();
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateUserStatus = async (status: boolean) => {
      const date = new Date();
      const formattedDate = new Date(date).toLocaleString();

      await supabase
        .from("users")
        .update({ last_active: formattedDate, is_online: status })
        .eq("id", currentUserId);
    };

    const throttledUpdateStatusOnline = throttle(() => {
      updateUserStatus(true);
    }, 10000);

    const markAsInactive = async () => {
      updateUserStatus(false);
    };

    const resetInactivityTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(markAsInactive, 5 * 60 * 1000); // 5 minutes inactivity
    };

    const handleUserActivity = () => {
      throttledUpdateStatusOnline();
      resetInactivityTimeout();
    };

    document.addEventListener("mousemove", handleUserActivity);
    document.addEventListener("keydown", handleUserActivity);

    handleUserActivity();

    return () => {
      document.removeEventListener("mousemove", handleUserActivity);
      document.removeEventListener("keydown", handleUserActivity);
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);
};

export default useUserStatus;
