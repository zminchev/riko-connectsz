import { useState, useRef } from "react";
import { supabase } from "src/utils/supabase/component";
import { IoAddCircle } from "react-icons/io5";
import { FaCamera } from "react-icons/fa";
import Button from "../Button";

const ImageUpload = ({ onUpload }: { onUpload: any }) => {
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
        throw uploadError;
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("chat_images")
          .createSignedUrl(filePath, 60 * 60 * 24); // URL valid for 24 hours

      if (signedUrlError) {
        console.log(signedUrlError);
      }

      onUpload(event, signedUrlData?.signedUrl);
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
    <div className="flex p-3">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={uploadImage}
        disabled={uploading}
      />
      <input
        type="file"
        ref={cameraInputRef}
        style={{ display: "none" }}
        accept="image/*"
        capture="environment"
        onChange={uploadImage}
        disabled={uploading}
      />
      <div className="flex gap-4">
        <Button
          onClick={handleButtonClick}
          disabled={uploading}
          icon={<IoAddCircle className="w-10 h-10" />}
        />
        <Button
          onClick={handleCameraClick}
          disabled={uploading}
          className="mr-4"
          icon={<FaCamera className="w-8 h-8" />}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
