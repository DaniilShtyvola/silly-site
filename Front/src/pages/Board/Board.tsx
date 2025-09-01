import { useEffect, useState } from "react";

import "./Board.css";

import { Spinner, Button } from "react-bootstrap";

import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
   faFaceLaugh,
   faFaceSadTear,
   faDownload,
} from "@fortawesome/free-solid-svg-icons";

import FixedMessage from "../../components/FixedMessage/FixedMessage.tsx";
import BoardPost from "../../components/BoardPost/BoardPost.tsx";

import type { Post, Board, Comment, User, BoardDto, ParentType } from "../../models/BoardResponse.ts";

import { parsePosts } from "../../utils/ParsePosts.ts";

const Board: React.FC = () => {
   const [boardData, setBoardData] = useState<Board | null>(null);

   const [skip, setSkip] = useState(0);
   const [take, setTake] = useState(4);

   const [isLoadingMore, setIsLoadingMore] = useState(false);
   const [loading, setLoading] = useState(true);

   const [message, setMessage] = useState<{
      text: string;
      variant: string;
      icon: IconDefinition;
   } | null>(null);

   const API_URL = import.meta.env.VITE_API_URL;

   const fetchBoard = async (newSkip: number, newTake: number, append = false) => {
      const token = localStorage.getItem("token");

      try {
         const headers: Record<string, string> = {};
         if (token) {
            headers["Authorization"] = `Bearer ${token}`;
         }

         const response = await axios.get<BoardDto>(
            `${API_URL}/board?skip=${newSkip}&take=${newTake}`,
            { headers }
         );

         const parsedPosts = parsePosts(response.data.posts);

         if (append && boardData) {
            const mergedPosts = [...boardData.posts, ...parsedPosts];

            const mergedUsersMap = new Map<string, User>();
            [...boardData.users, ...response.data.users].forEach(user => {
               mergedUsersMap.set(user.id, user);
            });

            setBoardData({
               posts: mergedPosts,
               users: Array.from(mergedUsersMap.values()),
               totalPosts: response.data.totalPosts,
            });
         } else {
            setBoardData({
               posts: parsedPosts,
               users: response.data.users,
               totalPosts: response.data.totalPosts,
            });
         }
      } catch (err) {
         console.error("Failed to fetch board:", err);

         setMessage({
            text: "Failed to fetch board.",
            variant: "danger",
            icon: faFaceSadTear,
         });
      } finally {
         setLoading(false);
         setIsLoadingMore(false);
      }
   };

   useEffect(() => {
      fetchBoard(0, 4, false);
   }, []);

   const loadMore = () => {
      if (!boardData) return;

      const remaining = boardData.totalPosts - boardData.posts.length;
      if (remaining <= 0) return;

      setIsLoadingMore(true);

      const newSkip = skip + take;
      const newTake = Math.min(3, remaining);

      fetchBoard(newSkip, newTake, true);

      setSkip(newSkip);
      setTake(newTake);
   };

   const handleDeleteComment = async (commentId: string) => {
      const token = localStorage.getItem("token");

      if (!token) {
         setMessage({
            text: "You must be logged in to delete comment.",
            variant: "danger",
            icon: faFaceSadTear,
         });
         return;
      }

      try {
         await axios.delete(`${API_URL}/board/comments/${commentId}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         });

         setBoardData(prev => {
            if (!prev) return prev;

            const markDeleted = (comments: Comment[]): Comment[] => {
               return comments.map(c => {
                  if (c.id === commentId) {
                     return { ...c, isDeleted: true };
                  }
                  if (c.replies.length > 0) {
                     return { ...c, replies: markDeleted(c.replies) };
                  }
                  return c;
               });
            };

            const updatedPosts = prev.posts.map(post => ({
               ...post,
               comments: markDeleted(post.comments)
            }));

            return { ...prev, posts: updatedPosts };
         });

         setMessage({
            text: "Successfully deleted comment!",
            variant: "success",
            icon: faFaceLaugh,
         });

      } catch (err) {
         console.error("Failed to delete comment:", err);

         setMessage({
            text: "Failed to delete comment.",
            variant: "danger",
            icon: faFaceSadTear,
         });
      }
   };

   const handleAddReply = async (parentId: string, text: string, parentType: ParentType) => {
      const token = localStorage.getItem("token");

      if (!token) {
         setMessage({
            text: "You must be logged in to add reply.",
            variant: "danger",
            icon: faFaceSadTear,
         });
         return;
      }

      try {
         const payload = {
            Text: text,
            ParentId: parentId,
            ParentType: parentType
         };

         const response = await axios.post(`${API_URL}/board/comments`, payload, {
            headers: {
               Authorization: `Bearer ${token}`
            },
         });

         const newComment: Comment = response.data;

         setBoardData(prev => {
            if (!prev) return prev;

            const addReply = (comments: Comment[]): Comment[] => {
               return comments.map(c => {
                  if (c.id === parentId && parentType === "comment") {
                     return { ...c, replies: [newComment, ...c.replies] };
                  }
                  if (c.replies.length > 0) {
                     return { ...c, replies: addReply(c.replies) };
                  }
                  return c;
               });
            };

            const updatedPosts = prev.posts.map(post => {
               if (parentType === "post" && post.id === parentId) {
                  return { ...post, comments: [newComment, ...post.comments] };
               }
               return { ...post, comments: addReply(post.comments) };
            });

            return { ...prev, posts: updatedPosts };
         });

         setMessage({
            text: "Successfully added reply!",
            variant: "success",
            icon: faFaceLaugh,
         });

      } catch (err) {
         console.error("Failed to add reply:", err);

         setMessage({
            text: "Failed to add reply.",
            variant: "danger",
            icon: faFaceSadTear,
         });
      }
   };

   const handleEditComment = async (commentId: string, text: string) => {
      const token = localStorage.getItem("token");

      if (!token) {
         setMessage({
            text: "You must be logged in to edit comment.",
            variant: "danger",
            icon: faFaceSadTear,
         });
         return;
      }

      try {
         await axios.put(
            `${API_URL}/board/comments/${commentId}`,
            { Text: text },
            { headers: { Authorization: `Bearer ${token}` } }
         );

         setBoardData(prev => {
            if (!prev) return prev;

            const updateComment = (comments: Comment[]): Comment[] => {
               return comments.map(c => {
                  if (c.id === commentId) {
                     return { ...c, text, isEdited: true };
                  }
                  if (c.replies.length > 0) {
                     return { ...c, replies: updateComment(c.replies) };
                  }
                  return c;
               });
            };

            const updatedPosts = prev.posts.map(post => ({
               ...post,
               comments: updateComment(post.comments),
            }));

            return { ...prev, posts: updatedPosts };
         });

         setMessage({
            text: "Successfully edited comment!",
            variant: "success",
            icon: faFaceLaugh,
         });

      } catch (err) {
         console.error("Failed to edit comment:", err);

         setMessage({
            text: "Failed to edit comment.",
            variant: "danger",
            icon: faFaceSadTear,
         });
      }
   };

   const handleToggleReaction = async (
      parentId: string,
      parentType: ParentType,
      type: string
   ) => {
      const token = localStorage.getItem("token");

      if (!token) {
         setMessage({
            text: "You must be logged in to toggle reaction.",
            variant: "danger",
            icon: faFaceSadTear,
         });
         return;
      }

      try {
         const payload = { Type: type, ParentId: parentId, ParentType: parentType };

         await axios.post(`${API_URL}/board/reactions`, payload, {
            headers: { Authorization: `Bearer ${token}` },
         });

         const updateCommentReactions = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
               if (comment.id === parentId) {
                  const existing = comment.reactions.find(r => r.type === type);

                  if (existing) {
                     existing.isMine = !existing.isMine;
                     existing.count += existing.isMine ? 1 : -1;
                     if (existing.count === 0) {
                        comment.reactions = comment.reactions.filter(r => r.type !== type);
                     }
                  } else {
                     comment.reactions.push({ type, count: 1, isMine: true });
                  }
               }

               if (comment.replies.length > 0) {
                  comment.replies = updateCommentReactions(comment.replies);
               }

               return comment;
            });
         };

         setBoardData(prev => {
            if (!prev) return prev;

            const updatedPosts = prev.posts.map(post => {
               if (parentType === "post" && post.id === parentId) {
                  const existing = post.reactions.find(r => r.type === type);

                  if (existing) {
                     existing.isMine = !existing.isMine;
                     existing.count += existing.isMine ? 1 : -1;
                     if (existing.count === 0) {
                        post.reactions = post.reactions.filter(r => r.type !== type);
                     }
                  } else {
                     post.reactions.push({ type, count: 1, isMine: true });
                  }
               }

               post.comments = updateCommentReactions(post.comments);

               return post;
            });

            return { ...prev, posts: updatedPosts };
         });

      } catch (err) {
         console.error("Failed to toggle reaction:", err);

         setMessage({
            text: "Failed to toggle reaction.",
            variant: "danger",
            icon: faFaceSadTear,
         });
      }
   };

   return (
      <div style={{
         color: "white",
         width: "640px"
      }}>
         {loading ? (
            <div style={{
               display: "flex",
               justifyContent: "center",
               marginTop: "2rem"
            }}>
               <Spinner
                  style={{
                     width: "21px",
                     height: "21px",
                     borderWidth: "3px",
                     color: "rgb(137, 143, 150)"
                  }}
               />
            </div>
         ) : boardData ? (
            <>
               {/* Posts section */}
               {boardData.posts
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((post: Post) => (
                     <BoardPost
                        key={post.id}
                        post={post}
                        users={boardData.users}
                        onToggleReaction={handleToggleReaction}
                        onDeleteComment={handleDeleteComment}
                        onAddReply={handleAddReply}
                        onEditComment={handleEditComment}
                        setMessage={setMessage}
                     />
                  ))}

               {/* Load more section */}
               <div
                  style={{
                     display: "flex",
                     justifyContent: "center",
                     marginTop: "1.5rem",
                     marginBottom: "2rem",
                  }}
               >
                  {boardData.posts.length < boardData.totalPosts ? (
                     <Button
                        style={{ display: "flex", alignItems: "center" }}
                        variant="dark"
                        onClick={loadMore}
                        disabled={isLoadingMore}
                     >
                        {isLoadingMore ? (
                           <Spinner
                              style={{
                                 width: "21px",
                                 height: "21px",
                                 borderWidth: "3px",
                              }}
                           />
                        ) : (
                           <>
                              <FontAwesomeIcon
                                 icon={faDownload}
                                 style={{ marginRight: "4px" }}
                              />
                              Load more
                           </>
                        )}
                     </Button>
                  ) : (
                     <p
                        style={{
                           color: "rgb(137, 143, 150)",
                           fontSize: "0.9rem",
                        }}
                     >
                        <FontAwesomeIcon icon={faFaceSadTear} /> No more posts
                     </p>
                  )}
               </div>
            </>
         ) : (
            <p
               style={{
                  color: "rgb(137, 143, 150)",
                  fontSize: "0.9rem",
                  textAlign: "center",
               }}
            >
               <FontAwesomeIcon icon={faFaceSadTear} /> No board data
            </p>
         )}

         {/* Message in bottom left corner */}
         <FixedMessage
            message={message}
            onClose={() => setMessage(null)}
         />
      </div>
   );
};

export default Board;