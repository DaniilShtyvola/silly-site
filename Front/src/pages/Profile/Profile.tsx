// import React, { useEffect, useState } from "react";
// import axios from "axios";
// //import { format } from "date-fns";

// interface CommentMinimizedResponse {
//   id: number;
//   text: string;
//   createdAt: string;
//   catNormalizedName: string;
// }

// interface UserInfoResponse {
//   registeredAt: string;
//   catReactionsCount: number;
//   receivedReactionsOnCommentsCount: number;
//   latestComments: CommentMinimizedResponse[];
// }

// const Profile: React.FC = () => {
//   const [info, setInfo] = useState<UserInfoResponse | null>(null);
//   const [avatar, setAvatar] = useState<string | null>(null);
//   const [avatarFile, setAvatarFile] = useState<File | null>(null);

//   const API_URL = import.meta.env.VITE_API_URL;

//   useEffect(() => {
//     const fetchInfo = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get<UserInfoResponse>(`${API_URL}/auth/info`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setInfo(response.data);
//       } catch (error) {
//         console.error("Failed to fetch user info:", error);
//       }
//     };

//     fetchInfo();
//   }, []);

//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.[0]) {
//       setAvatarFile(e.target.files[0]);
//       setAvatar(URL.createObjectURL(e.target.files[0]));
//     }
//   };

//   const handleAvatarUpload = async () => {
//     if (!avatarFile) return;

//     const formData = new FormData();
//     formData.append("avatar", avatarFile);

//     try {
//       const token = localStorage.getItem("token");
//       await axios.post(`${API_URL}/user/upload-avatar`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       alert("Avatar uploaded successfully!");
//     } catch (error) {
//       console.error("Avatar upload failed:", error);
//       alert("Failed to upload avatar.");
//     }
//   };

//   if (!info) return <p>Loading...</p>;

//   return (
//     <div style={{ maxWidth: "600px", margin: "0 auto" }}>
//       <h2>My Profile</h2>

//       <div style={{ marginBottom: "20px" }}>
//         <strong>Registered:</strong>{" "}
//         {format(new Date(info.registeredAt), "yyyy-MM-dd")}
//       </div>
//       <div>
//         <strong>Cat reactions given:</strong> {info.catReactionsCount}
//       </div>
//       <div>
//         <strong>Reactions received on comments:</strong> {info.receivedReactionsOnCommentsCount}
//       </div>

//       <h3 style={{ marginTop: "20px" }}>Latest Comments</h3>
//       <ul>
//         {info.latestComments.map((comment) => (
//           <li key={comment.id} style={{ marginBottom: "10px" }}>
//             <div><strong>Cat:</strong> {comment.catNormalizedName}</div>
//             <div><strong>Text:</strong> {comment.text}</div>
//             <div style={{ fontSize: "80%", color: "#666" }}>
//               {format(new Date(comment.createdAt), "yyyy-MM-dd HH:mm")}
//             </div>
//           </li>
//         ))}
//       </ul>

//       <h3>Change Avatar</h3>
//       <input type="file" accept="image/*" onChange={handleAvatarChange} />
//       {avatar && (
//         <div style={{ marginTop: "10px" }}>
//           <img
//             src={avatar}
//             alt="Preview"
//             style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%" }}
//           />
//           <br />
//           <button onClick={handleAvatarUpload} style={{ marginTop: "10px" }}>
//             Upload Avatar
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Profile;
