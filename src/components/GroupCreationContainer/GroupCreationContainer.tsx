import React, { useEffect, useRef, useState } from 'react';
import Button from '../Button';
import { User } from 'src/types/User.types';
import { createClient } from 'src/utils/supabase/component';
import { AiOutlineEdit, AiOutlineLoading3Quarters } from 'react-icons/ai';
import Image from 'next/image';
import Input from '../Input';

const GroupCreationContainer = () => {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const uploadImageRef = useRef<HTMLInputElement>(null);
  const checkboxRef = React.createRef<HTMLInputElement>();

  const handleUploadImageClick = () => {
    if (uploadImageRef.current) {
      uploadImageRef.current.click();
    }
  };

  const createGroup = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to create a group.');
      return;
    }

    if (!groupName || groupName.trim() === '') {
      alert('Group name cannot be empty');
      return;
    }

    setLoading(true);
    setIsCreatingGroup(true);

    let uploadedProfilePhotoUrl = '';

    if (selectedImageFile) {
      const fileExt = selectedImageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `room_photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('room_photos')
        .upload(filePath, selectedImageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return;
      }

      const { data: imageData } = supabase.storage
        .from('room_photos')
        .getPublicUrl(filePath);

      uploadedProfilePhotoUrl = imageData.publicUrl;
    }
    const { data: roomData, error } = await supabase
      .from('rooms')
      .insert([{ name: groupName, room_photo: uploadedProfilePhotoUrl }])
      .select('id');

    if (error) {
      console.error('Error creating group:', error.message);
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
      .from('room_participants')
      .insert(participants);

    if (insertError) {
      console.error('Error adding participants:', insertError.message);
      setLoading(false);
      return;
    }

    setGroupName('');
    setSelectedUsers([]);

    setLoading(false);
    setIsCreatingGroup(false);
  };

  const handleUserSelection = (user: User, isChecked: boolean) => {
    if (isChecked) {
      // Add user to selectedUsers
      setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, user]);
    } else {
      // Remove user from selectedUsers
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((u) => u.id !== user.id),
      );
    }
  };

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      const { data: currentUserData } = await supabase.auth.getUser();
      const currentUserId = currentUserData?.user?.id;

      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', currentUserId);

      if (error) console.error('Error fetching users:', error.message);
      else setUsers(usersData);

      setLoading(false);
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center p-4 w-full h-full gap-4 rounded-b-md text-black">
        <h2 className="text-center text-xl pb-4">
          Choose who you want to create a group chat with
        </h2>
        <h3 className="text-lg">Choose a group photo</h3>
        <div className="relative rounded-md">
          <div className="absolute -top-4 text-white -right-4 bg-gray-500 rounded-full z-10 flex items-center justify-center">
            <input
              type="file"
              ref={uploadImageRef}
              accept="image/*"
              onChange={handleImagePreview}
              hidden
            />
            <Button
              className="text-black p-2"
              onClick={handleUploadImageClick}
              icon={<AiOutlineEdit className="w-6 h-6 text-white" />}
            />
          </div>
          <div className="w-44 h-44 rounded-md overflow-hidden shadow-md shadow-black/25 relative">
            {imagePreviewUrl ? (
              <Image
                src={imagePreviewUrl}
                fill
                sizes=""
                className="object-cover"
                alt="Profile Preview"
                priority
              />
            ) : (
              <div className="w-full h-full flex justify-center items-center text-7xl">
                GRP
              </div>
            )}
          </div>
        </div>
        <h3 className="text-lg">Group name</h3>
        <Input
          type="text"
          id="group-name"
          value={groupName}
          placeholder="Group Name"
          className="w-full text-black border border-gray-400/25"
          onChange={handleGroupNameChange}
        />
        <h3 className="text-lg">Select users</h3>
        <div className="user-selection w-full max-h-72 overflow-y-auto p-4 rounded-md text-black divide-y flex justify-center flex-col">
          {!loading ? (
            users.map((user) => (
              <div key={user.id} className="flex items-center p-2">
                <input
                  ref={checkboxRef}
                  type="checkbox"
                  id={`user-${user.id}`}
                  value={user.id}
                  onChange={(e) => handleUserSelection(user, e.target.checked)}
                  className="mr-2 accent-cyan-500"
                />
                <label htmlFor={`user-${user.id}`}>
                  {user.first_name} {user.last_name}
                </label>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <AiOutlineLoading3Quarters className="animate-spin w-8 h-8" />
            </div>
          )}
        </div>
        <Button
          text={`${
            loading && isCreatingGroup ? 'Creating...' : 'Create Group'
          }`}
          className="bg-cyan-500 p-4 rounded-sm text-white disabled:bg-gray-500 disabled:text-message-text disabled:opacity-45 disabled:cursor-not-allowed"
          onClick={createGroup}
          disabled={loading}
        />
      </div>
    </>
  );
};

export default GroupCreationContainer;
