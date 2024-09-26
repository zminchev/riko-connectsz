import React, { useEffect, useState } from "react";
import { supabase } from "src/utils/supabase/component";
import { timeSince } from "src/utils/timeSince";

const OtherUserStatus = ({ otherUserId }: { otherUserId?: string }) => {
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
  }, [otherUserId]);

  return (
    <div className="text-xs">
      <span>
        {otherUserStatus.is_online ? (
          <span className="text-accent-secondary font-bold">Online</span>
        ) : (
          <span className="text-gray-300 font-bold">
            Last seen: {timeSince(otherUserStatus.last_active)}
          </span>
        )}
      </span>
    </div>
  );
};

export default OtherUserStatus;
