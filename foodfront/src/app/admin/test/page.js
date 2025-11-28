// "use client";

// import { useState } from "react";

// import Image from "next/image";

// const UPLOAD_PRESET = "foodDeliver";

// const CLOUD_NAME = "dvojuhce4";

// export default function Home() {
//   const [logoUrl, setLogoUrl] = useState("");

//   const [uploading, setUploading] = useState(false);

//   const uploadToCloudinary = async (file) => {
//     const formData = new FormData();

//     formData.append("file", file);

//     formData.append("upload_preset", UPLOAD_PRESET);

//     try {
//       const response = await fetch(
//         `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

//         {
//           method: "POST",

//           body: formData,
//         }
//       );

//       const data = await response.json();

//       return data.secure_url;
//     } catch (error) {
//       console.error("Cloudinary upload failed:", error);
//     }
//   };

//   const handleLogoUpload = async (event) => {
//     const file = event.target.files[0];

//     if (!file) return;

//     setUploading(true);

//     try {
//       const url = await uploadToCloudinary(file);

//       setLogoUrl(url);
//     } catch (err) {
//       console.log("Failed to upload logo: " + err.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="mb-8 p-6 bg-white rounded-lg shadow">
//       <input
//         type="file"
//         accept="image/*"
//         onChange={handleLogoUpload}
//         disabled={uploading}
//         className="mb-4 p-2 border border-gray-300 rounded"
//       />

//       {uploading && <p className="text-blue-600">Uploading...</p>}

//       {logoUrl && (
//         <div className="mt-4">
//           <p className="text-green-600 font-semibold mb-2">Logo uploaded!</p>

//           <div className="relative w-64 h-64">
//             <Image
//               src={logoUrl}
//               alt="Uploaded logo"
//               fill
//               className="object-contain rounded border border-gray-300"
//             />
//           </div>

//           <p className="mt-2 text-sm text-gray-600 break-all">{logoUrl}</p>
//         </div>
//       )}
//     </div>
//   );
// }
