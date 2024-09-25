// components/ImageUpload.js
import { useState, useRef } from "react";
import { createClient } from "src/utils/supabase/component";
import { IoAddCircle } from "react-icons/io5";
import Button from "../Button";

const ImageUpload = ({ onUpload }: { onUpload: any }) => {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<any>(null);

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

  return (
    <div className="flex p-3">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        capture="environment"
        onChange={uploadImage}
        disabled={uploading}
      />
      <Button
        onClick={handleButtonClick}
        disabled={uploading}
        icon={<IoAddCircle className="w-10 h-10"/>}
      />
    </div>
  );
};

export default ImageUpload;
