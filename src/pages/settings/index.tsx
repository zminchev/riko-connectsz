import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import Card from 'src/components/Card';
import Input from 'src/components/Input';
import { User } from 'src/types/User.types';
import { AiOutlineEdit } from 'react-icons/ai';
import { getUserLettersFromName } from 'src/utils/getUserLettersFromName';
import { createClient as createServerClient } from 'src/utils/supabase/server-props';
import { createClient } from 'src/utils/supabase/component';
import Button from 'src/components/Button';
import PageMeta from 'src/components/PageMeta';
import ChatSidebar from 'src/components/ChatSidebar';
import { Chat } from 'src/types/Chat.types';
import { Group } from 'src/types/Group.types';

const SettingsPage = ({
  userData,
  chats,
  // groups,
}: {
  userData: User;
  chats: Chat[];
  groups: Group[];
}) => {
  const supabase = createClient();
  const { id, email, profile_photo, first_name, last_name } = userData;

  const [userEmail, setUserEmail] = useState(email);
  const [userFirstName, setUserFirstName] = useState(first_name);
  const [userLastName, setUserLastName] = useState(last_name);

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const uploadImageRef = useRef<HTMLInputElement>(null);

  const { fallbackName } = getUserLettersFromName({
    firstName: userFirstName,
    lastName: userLastName,
  });

  const handleUploadImageClick = () => {
    if (uploadImageRef.current) {
      uploadImageRef.current.click();
    }
  };

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true);

      let uploadedProfilePhotoUrl = profile_photo;

      if (selectedImageFile) {
        const fileExt = selectedImageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `profile_photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profile_photos')
          .upload(filePath, selectedImageFile);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          return;
        }

        const { data: imageData } = supabase.storage
          .from('profile_photos')
          .getPublicUrl(filePath);
        uploadedProfilePhotoUrl = imageData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: userFirstName,
          last_name: userLastName,
          profile_photo: uploadedProfilePhotoUrl,
        })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      } else {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <PageMeta title="Settings | Riko ConnectsZ" />
      <div className="flex">
        <ChatSidebar chats={chats} currentUserId={id} />
        <div className="text-gray-500 h-screen w-full flex flex-col gap-2 items-center justify-center p-2">
          <Card className="p-4 flex flex-col gap-2 w-full h-full">
            <Card className="w-1/3 p-2">
              <h2 className="text-xl text-center">Profile</h2>
              <div className="flex flex-col items-center p-10">
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
                      className="text-white p-2"
                      onClick={handleUploadImageClick}
                      icon={<AiOutlineEdit className="w-6 h-6" />}
                    />
                  </div>
                  <div className="w-44 h-44 rounded-md overflow-hidden shadow-md shadow-black/25 relative">
                    {imagePreviewUrl && (
                      <Image
                        src={imagePreviewUrl}
                        fill
                        className="object-cover"
                        alt="Profile Preview"
                        priority
                      />
                    )}
                    {profile_photo && !imagePreviewUrl ? (
                      <Image
                        src={profile_photo}
                        fill
                        className="object-cover"
                        alt={`${userFirstName} ${userLastName} profile photo`}
                      />
                    ) : (
                      <div className="w-full h-full flex justify-center items-center text-8xl">
                        {fallbackName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  id="settings-email"
                  type="text"
                  value={userEmail}
                  className="w-full border border-gray-500/25"
                  placeholder="Email"
                  onChange={(e) => setUserEmail(e.target.value)}
                />
                <Input
                  id="settings-first-name"
                  type="text"
                  value={userFirstName}
                  className="w-full border border-gray-500/25"
                  placeholder="First name"
                  onChange={(e) => setUserFirstName(e.target.value)}
                />
                <Input
                  id="settings-last-name"
                  type="text"
                  value={userLastName}
                  className="w-full border border-gray-500/25"
                  placeholder="Last name"
                  onChange={(e) => setUserLastName(e.target.value)}
                />
              </div>
            </Card>
            <div className="flex items-center justify-center w-1/3">
              <Card className="w-full p-2 flex items-center justify-center">
                <Button
                  text="Save"
                  className="bg-cyan-600 text-white p-4 rounded-sm w-1/4 hover:bg-cyan-400 transition-colors duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                  onClick={handleSaveProfile}
                />
              </Card>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerClient({ req: ctx.req, res: ctx.res });
  const { data } = await supabase.auth.getUser();
  const currentUserId = data?.user?.id;

  if (!data) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user?.id)
    .single();

  const { data: chatsData } = await supabase
    .from('chats')
    .select(
      `
    id,
    participant_1_id,
    participant_2_id,
    created_at,
    participant_1:participant_1_id(first_name, last_name, profile_photo),
    participant_2:participant_2_id(first_name, last_name, profile_photo)
  `,
    )
    .or(
      `participant_1_id.eq.${currentUserId},participant_2_id.eq.${currentUserId}`,
    );

  if (error) {
    console.error('Error fetching user data:', error.message);
  }

  const { data: userGroups, error: userGroupsError } = await supabase
    .from('room_participants')
    .select('room_id')
    .eq('user_id', currentUserId);

  if (userGroupsError) {
    console.error('Error fetching user rooms:', userGroupsError.message);
    return { props: { groups: [], currentUserId } };
  }

  const groupIds = userGroups.map((rp) => rp.room_id);

  if (groupIds.length === 0) {
    // User is not part of any rooms
    return {
      props: {
        groups: [],
        currentUserId,
      },
    };
  }

  const { data: groupData, error: groupsError } = await supabase
    .from('rooms')
    .select(
      `
      id,
      name,
      room_participants (
        user_id,
        users (
          first_name,
          last_name
        )
      )
    `,
    )
    .in('id', groupIds);

  if (groupsError) {
    console.error('Error fetching rooms:', groupsError.message);
    return { props: { groups: [], currentUserId } };
  }

  return {
    props: {
      chats: chatsData || [],
      groups: groupData || [],
      userData: userData || {},
    },
  };
};
