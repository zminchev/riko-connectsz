import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Button from "../Button";
import { User } from "src/types/User.types";
import { supabase } from "src/utils/supabase/component";
import Input from "../Input";

const GroupCreationContainer = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const checkboxRef = React.createRef<HTMLInputElement>();

  const createGroup = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user to create a group.");
      return;
    }

    setLoading(true);
    const { data: roomData, error } = await supabase
      .from("rooms")
      .insert([{ name: groupName }])
      .select("id");

    if (error) {
      console.error("Error creating group:", error.message);
      setLoading(false);
      return;
    }

    const roomId = roomData[0].id;

    // Get current user
    const { data: currentUserData } = await supabase.auth.getUser();
    const currentUserId = currentUserData?.user?.id;

    // Prepare participants array
    const participants = selectedUsers.map((user) => ({
      room_id: roomId,
      user_id: user.id,
    }));

    // Add the current user to participants
    participants.push({
      room_id: roomId,
      user_id: currentUserId as string,
    });

    // **Bulk insert participants in a single request**
    const { error: insertError } = await supabase
      .from("room_participants")
      .insert(participants);

    if (insertError) {
      console.error("Error adding participants:", insertError.message);
      setLoading(false);
      return;
    }

    setGroupName("");
    setSelectedUsers([]);

    setLoading(false);
  };

  const handleUserSelection = (user: User, isChecked: boolean) => {
    if (isChecked) {
      // Add user to selectedUsers
      setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, user]);
    } else {
      // Remove user from selectedUsers
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((u) => u.id !== user.id)
      );
    }
  };

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value || e.target.value.trim() === "") {
      alert("Group name cannot be empty");
      return;
    }

    setGroupName(e.target.value);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: currentUserData } = await supabase.auth.getUser();
      const currentUserId = currentUserData?.user?.id;

      const { data: usersData, error } = await supabase
        .from("users")
        .select("*")
        .neq("id", currentUserId);

      if (error) console.error("Error fetching users:", error.message);
      else setUsers(usersData);
    };

    fetchUsers();
  }, []);
  return (
    <div
      className={`z-10 bg-red-500 rounded-md w-auto h-[600px] ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="w-full flex justify-end p-4">
        <Button icon={<IoClose className="w-6 h-6" />} onClick={onClose} />
      </div>
      <div className="bg-red-600 flex flex-col justify-center items-center p-4 w-full h-full gap-4 rounded-b-md">
        <h2 className="text-center text-xl pb-4">
          Choose who you want to create a group chat with
        </h2>
        <Input
          type="text"
          id="group-name"
          value={groupName}
          placeholder="Group Name"
          className="w-full"
          onChange={handleGroupNameChange}
        />
        <div className="user-selection w-full max-h-64 overflow-y-auto p-4 bg-white rounded-md text-dark-primary">
          {users.map((user) => (
            <div key={user.id} className="flex items-center mb-2">
              <input
                ref={checkboxRef}
                type="checkbox"
                id={`user-${user.id}`}
                value={user.id}
                onChange={(e) => handleUserSelection(user, e.target.checked)}
                className="mr-2"
              />
              <label htmlFor={`user-${user.id}`}>
                {user.first_name} {user.last_name}
              </label>
            </div>
          ))}
        </div>
        <Button
          text={`${loading ? "Creating..." : "Create Group"}`}
          className="bg-accent-primary p-2 rounded-sm text-black font-bold"
          onClick={createGroup}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default GroupCreationContainer;
