import { useState, useRef } from "react";
import { createClient } from "src/utils/supabase/component";
import { RiGalleryLine } from "react-icons/ri";
import { IoCameraOutline } from "react-icons/io5";
import Button from "../Button";

const ImageUpload = ({ onUpload }: { onUpload: any }) => {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<any>(null);
  const cameraInputRef = useRef<any>(null);

  const uploadImage = async (event: any) => {
    try {
      setUploading(true);

      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat_images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload Error while trying to upload: ", uploadError);
      }

      const { data: signedUrlData } = supabase.storage
        .from("chat_images")
        .getPublicUrl(filePath);

      onUpload(event, signedUrlData?.publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  return (
    <div className="flex p-1">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*,video/*"
        onChange={uploadImage}
        disabled={uploading}
      />
      <input
        type="file"
        ref={cameraInputRef}
        style={{ display: "none" }}
        accept="image/*,video/*"
        capture="environment"
        onChange={uploadImage}
        disabled={uploading}
      />
      <div className="flex gap-4 border-r border-cyan-500 pr-2">
        <Button
          onClick={handleButtonClick}
          disabled={uploading}
          className="text-black"
          icon={<RiGalleryLine className="w-6 h-6" />}
        />
        <Button
          onClick={handleCameraClick}
          disabled={uploading}
          className="text-black"
          icon={<IoCameraOutline className="w-6 h-6" />}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
