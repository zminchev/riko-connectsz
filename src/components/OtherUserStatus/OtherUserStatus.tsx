import React, { useEffect, useState } from "react";
import { createClient } from "src/utils/supabase/component";
import { timeSince } from "src/utils/timeSince";

const OtherUserStatus = ({ otherUserId }: { otherUserId?: string }) => {
  const supabase = createClient();

  const [otherUserStatus, setOtherUserStatus] = useState({
    is_online: false,
    last_active: "",
  });

  useEffect(() => {
    const fetchUserStatus = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("is_online, last_active")
        .eq("id", otherUserId)
        .single();

      if (error) {
        console.error("Error fetching user status:", error);
        return;
      }
      setOtherUserStatus(data);
    };

    fetchUserStatus();

    const subscription = supabase
      .channel("realtime:user_status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${otherUserId}`,
        },
        (payload) => {
          const updatedUser = payload.new;
          setOtherUserStatus({
            is_online: updatedUser.is_online,
            last_active: updatedUser.last_active,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId]);

  return (
    <div className="text-xs">
      <span>
        {otherUserStatus.is_online ? (
          <span className="text-accent-secondary">Online</span>
        ) : (
          <span className="text-gray-500">
            Last seen: {timeSince(otherUserStatus.last_active)}
          </span>
        )}
      </span>
    </div>
  );
};

export default OtherUserStatus;
