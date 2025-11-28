"use client";

import { useState } from "react";
import Image from "next/image";

export default function UploadImage({ onUpload }) {
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "foodDeliver");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dvojuhce4/image/upload",
      { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadToCloudinary(file);

      setLogoUrl(url);

      // ⬅️ CLOUDINARY URL parent руу дамжуулна
      if (onUpload) onUpload(url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        disabled={uploading}
        className="p-2 border rounded"
      />

      {uploading && <p>Uploading...</p>}

      {logoUrl && (
        <img
          src={logoUrl}
          alt="Uploaded"
          className="w-32 h-32 object-cover rounded mt-2"
        />
      )}
    </div>
  );
}
