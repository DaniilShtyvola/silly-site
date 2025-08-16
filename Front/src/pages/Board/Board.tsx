import { useEffect, useState, useRef } from "react";

import axios from "axios";

import GradientUsername from "../../components/GradientUsername/GradientUsername.tsx";
import GradientAvatar from "../../components/GradientAvatar/GradientAvatar.tsx";
import ExpandToggle from "../../components/ExpandToggle/ExpandToggle.tsx";
import ReplyBox from "../../components/ReplyBox/ReplyBox.tsx";
import ActionsPanel from "../../components/ActionsPanel/ActionsPanel.tsx";

import type { BoardResponseDto, CommentDto, UserDto, PostWithCommentsDto } from "../../models/BoardResponse.ts";

import { formatTime } from "../../utils/FormatTime.ts";
import { parseStyle } from "../../utils/ParseStyle.ts";
import { ReactionIcons } from "../../utils/ReactionIcons";
import { updateReactionsInBoard } from "../../utils/UpdateCommentReactions.ts";

interface CommentProps {
   comment: CommentDto;
   users: UserDto[];
   isLast: boolean;
   onAddReaction: (parentId: string, type: string, parentType: "post" | "comment") => void;
   onDeleteReaction: (parentId: string, reactionId: string, type: string, parentType: "post" | "comment") => void;
   onAddReply: (parentId: string, text: string, parentType: "post" | "comment") => void;
}

const Comment: React.FC<CommentProps> = ({ comment, users, isLast, onAddReaction, onDeleteReaction, onAddReply }) => {
   const [isExpanded, setIsExpanded] = useState(false);
   const [isReplying, setIsReplying] = useState(false);
   const [showNewReactionList, setShowNewReactionList] = useState(false);

   const user = users.find(u => u.id === comment.userId);
   const style = parseStyle(user!.style);

   const availableReactions = Object.keys(ReactionIcons).filter(
      (type) => !(type in comment.reactionCounts)
   );

   const reactionWrapperRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (
            reactionWrapperRef.current &&
            !reactionWrapperRef.current.contains(event.target as Node)
         ) {
            setShowNewReactionList(false);
         }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);

   return (
      <div key={comment.id}>
         <div style={{
            color: "white",
         }}>
            <div style={{
               display: "flex"
            }}>
               <div style={{
                  display: "flex",
                  flexDirection: "column",
                  marginLeft: "1rem",
               }}>
                  <div style={{
                     borderLeft: "rgb(49, 53, 58) 2px solid",
                     borderBottom: "rgb(49, 53, 58) 2px solid",
                     borderBottomLeftRadius: isLast ? "1rem" : "0",
                     width: "1rem",
                     height: "4rem"
                  }} />
                  <div style={{
                     flex: 1,
                     borderLeft: isLast ? "none" : "rgb(49, 53, 58) 2px solid",
                  }} />
               </div>
               <div
                  style={{
                     display: "flex",
                     alignItems: "flex-start",
                     padding: "1rem",
                     backgroundColor: "rgb(33, 37, 41)",
                     marginTop: "1.4rem",
                  }}
               >

                  <div style={{
                     marginTop: "2px"
                  }}>
                     <GradientAvatar
                        icon={style.avatarIcon}
                        colors={style.avatarColors}
                        direction={style.avatarDirection}
                        size={40}
                        backgroundColor="rgb(33, 37, 41)"
                     />
                  </div>
                  <div style={{
                     marginLeft: "1rem",
                  }}>
                     <div style={{
                        fontSize: "1.1rem",
                        display: "flex",
                        alignItems: "center"
                     }}>
                        <GradientUsername
                           text={user?.userName || "Unknown"}
                           colors={style.userNameColors}
                        />
                        <p style={{
                           fontSize: "0.8rem",
                           color: "rgb(137, 143, 150)",
                           marginLeft: "8px"
                        }}>
                           {formatTime(comment.createdAt)}
                        </p>
                     </div>
                     <p>{comment.text}</p>

                     <ActionsPanel
                        availableReactions={availableReactions}
                        parentId={comment.id}
                        parentType="comment"
                        reactionWrapperRef={reactionWrapperRef}
                        showNewReactionList={showNewReactionList}
                        setShowNewReactionList={setShowNewReactionList}
                        reactions={comment}
                        onAddReaction={onAddReaction}
                        onDeleteReaction={onDeleteReaction}
                        isReplying={isReplying}
                        setIsReplying={setIsReplying}
                        style={{
                           top: "4px"
                        }}
                     />
                  </div>
               </div>
            </div>

            {comment.replies.length > 0 && (
               <ExpandToggle
                  isExpanded={isExpanded}
                  onToggle={() => setIsExpanded(!isExpanded)}
                  left="3.6rem"
               />
            )}

            {isReplying && (
               <ReplyBox
                  parentId={comment.id}
                  parentType="comment"
                  isLast={isLast}
                  isExpanded={isExpanded}
                  onAddReply={onAddReply}
                  onCancel={() => setIsReplying(false)}
               />
            )}

            {(comment.replies.length > 0 && isExpanded) && (
               <div style={{
                  display: "flex",
               }}>
                  <div style={{
                     marginLeft: "1rem",
                     borderLeft: !isLast ? "rgb(49, 53, 58) 2px solid" : "none",
                     width: "2.4rem",
                     flexShrink: 0,
                  }} />

                  <div>
                     {comment.replies.map((reply, index) => {
                        const isLastReply = index === comment.replies.length - 1;
                        return (
                           <Comment
                              key={reply.id}
                              comment={reply}
                              users={users}
                              isLast={isLastReply}
                              onAddReaction={onAddReaction}
                              onDeleteReaction={onDeleteReaction}
                              onAddReply={onAddReply}
                           />
                        );
                     })}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

interface PostProps {
   post: PostWithCommentsDto;
   users: UserDto[];
   onAddReaction: (parentId: string, type: string, parentType: "post" | "comment") => void;
   onDeleteReaction: (parentId: string, reactionId: string, type: string, parentType: "post" | "comment") => void;
   onAddReply: (parentId: string, text: string, parentType: "post" | "comment") => void;
}

const Post: React.FC<PostProps> = ({ post, users, onAddReaction, onDeleteReaction, onAddReply }) => {
   const [isExpanded, setIsExpanded] = useState(false);
   const [isReplying, setIsReplying] = useState(false);
   const [showNewReactionList, setShowNewReactionList] = useState(false);

   const availableReactions = Object.keys(ReactionIcons).filter(
      (type) => !(type in post.reactionCounts)
   );

   const reactionWrapperRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (
            reactionWrapperRef.current &&
            !reactionWrapperRef.current.contains(event.target as Node)
         ) {
            setShowNewReactionList(false);
         }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);

   return (
      <div key={post.id}>
         <div style={{
            backgroundColor: "rgb(33, 37, 41)",
            padding: "1rem 20px",
            marginTop: "2rem"
         }}>
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            <small>
               {new Date(post.createdAt).toLocaleString(undefined, {
                  year: "2-digit",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
               })}
            </small>

            <ActionsPanel
               availableReactions={availableReactions}
               parentId={post.id}
               parentType="post"
               reactionWrapperRef={reactionWrapperRef}
               showNewReactionList={showNewReactionList}
               setShowNewReactionList={setShowNewReactionList}
               reactions={{
                  reactionCounts: post.reactionCounts,
                  myReactions: post.myReactions
               }}
               onAddReaction={onAddReaction}
               onDeleteReaction={onDeleteReaction}
               isReplying={isReplying}
               setIsReplying={setIsReplying}
               style={{
                  top: "3px",
                  left: "2.5rem"
               }}
            />
         </div>

         {post.comments.length > 0 && (
            <ExpandToggle
               isExpanded={isExpanded}
               onToggle={() => setIsExpanded(!isExpanded)}
               left="1.2rem"
            />
         )}

         {isReplying && (
            <ReplyBox
               parentId={post.id}
               parentType="post"
               isLast={true}
               isExpanded={isExpanded}
               onAddReply={onAddReply}
               onCancel={() => setIsReplying(false)}
            />
         )}

         <div style={{
            marginLeft: "1rem"
         }}>
            {(post.comments.length > 0 && isExpanded) && (
               post.comments.map((comment, index) => {
                  const isLast = index === post.comments.length - 1;

                  return (
                     <Comment
                        key={comment.id}
                        comment={comment}
                        users={users}
                        isLast={isLast}
                        onAddReaction={onAddReaction}
                        onDeleteReaction={onDeleteReaction}
                        onAddReply={onAddReply}
                     />
                  );
               })
            )}
         </div>
      </div>
   );
};

const Board: React.FC = () => {
   const [boardData, setBoardData] = useState<BoardResponseDto | null>(null);
   const [loading, setLoading] = useState(true);

   const API_URL = import.meta.env.VITE_API_URL;

   const fetchBoard = async () => {
      const token = localStorage.getItem("token");

      try {
         const headers: Record<string, string> = {};
         if (token) {
            headers["Authorization"] = `Bearer ${token}`;
         }

         const response = await axios.get(`${API_URL}/board`, { headers });

         setBoardData(response.data);
      } catch (err) {
         console.error("Failed to fetch board:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBoard();


      console.log(boardData);
   }, []);

   type ParentType = "post" | "comment";

   const handleAddReply = async (parentId: string, text: string, parentType: ParentType) => {
      const token = localStorage.getItem("token");

      if (!token) {
         return;
      }

      const payload: any = { text };
      if (parentType === "comment") payload.parentCommentId = parentId;
      if (parentType === "post") payload.postId = parentId;

      const response = await axios.post(`${API_URL}/board/comments`, payload, {
         headers: {
            Authorization: `Bearer ${token}`
         },
      });

      const newComment: CommentDto = response.data;

      setBoardData(prev => {
         if (!prev) return prev;

         const addReply = (comments: CommentDto[]): CommentDto[] => {
            return comments.map(c => {
               if (c.id === parentId && parentType === "comment") {
                  return { ...c, replies: [...c.replies, newComment] };
               }
               return { ...c, replies: addReply(c.replies) };
            });
         };

         return {
            ...prev,
            posts: prev.posts.map(post => {
               if (parentType === "post" && post.id === parentId) {
                  return { ...post, comments: [...post.comments, newComment] };
               }
               return { ...post, comments: addReply(post.comments) };
            }),
         };
      });
   };

   const handleAddReaction = async (parentId: string, type: string, parentType: ParentType) => {
      const token = localStorage.getItem("token");

      if (!token) {
         return;
      }

      try {
         const payload: any = { Type: type };
         if (parentType === "post") payload.PostId = parentId;
         if (parentType === "comment") payload.CommentId = parentId;

         const response = await axios.post(`${API_URL}/board/reactions`, payload, {
            headers: {
               Authorization: `Bearer ${token}`
            },
         });

         const newReactionId = response.data.id;

         setBoardData(prev => {
            if (!prev) return prev;
            const updatedPosts = updateReactionsInBoard(prev.posts, parentId, type, newReactionId, parentType);
            return { ...prev, posts: updatedPosts };
         });
      } catch (err) {
         console.error("Failed to add reaction:", err);
      }
   };

   const handleDeleteReaction = async (parentId: string, reactionId: string, type: string, parentType: ParentType) => {
      const token = localStorage.getItem("token");

      if (!token) {
         return;
      }

      try {
         await axios.delete(`${API_URL}/board/reactions/${reactionId}`, {
            headers: {
               Authorization: `Bearer ${token}`
            },
         });

         setBoardData(prev => {
            if (!prev) return prev;
            const updatedPosts = updateReactionsInBoard(prev.posts, parentId, type, null, parentType);
            return { ...prev, posts: updatedPosts };
         });
      } catch (err) {
         console.error("Failed to delete reaction:", err);
      }
   };

   if (!boardData) return <p>No board data</p>;

   return (
      <div style={{
         color: "white",
         width: "640px",
         paddingBottom: "4rem"
      }}>
         <h3>Feed</h3>
         {boardData.posts
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((post: PostWithCommentsDto) => (
               <Post
                  key={post.id}
                  post={post}
                  users={boardData.users}
                  onAddReaction={handleAddReaction}
                  onDeleteReaction={handleDeleteReaction}
                  onAddReply={handleAddReply}
               />
            ))}
      </div>
   );
};

export default Board;



/*
{post.id === activePostId && (
                           <Form onSubmit={handleCommentSubmit}>
                              <p
                                 style={{ color: "rgb(128, 128, 128)", margin: "4px 8px", fontSize: "90%" }}
                              >
                                 <FontAwesomeIcon icon={faMessage} /> Start conversation
                              </p>
                              <Form.Group style={{ marginBottom: "0" }}>
                                 <Form.Control
                                    as="textarea"
                                    placeholder="Type your comment..."
                                    value={newComment}
                                    onChange={handleInputChange}
                                    required
                                    style={{ maxHeight: "200px", minHeight: "80px" }}
                                 />
                              </Form.Group>

                              {(hasInvalidCharacters || countWarning !== null) && (
                                 <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    {hasInvalidCharacters ? (
                                       <p
                                          style={{ color: "rgb(220, 53, 69)", margin: "4px 0 0", fontSize: "90%" }}
                                       >
                                          <FontAwesomeIcon icon={faCircleExclamation} /> Message contains disallowed
                                          characters
                                       </p>
                                    ) : (
                                       <div />
                                    )}
                                    {countWarning !== null && (
                                       <p
                                          style={{
                                             color: getInterpolatedColor(200 - (countWarning ?? 0)),
                                             margin: "4px 0 0",
                                             fontSize: "90%",
                                          }}
                                       >
                                          {countWarning}
                                       </p>
                                    )}
                                 </div>
                              )}

                              <Button
                                 className="w-100"
                                 style={{ marginTop: "1rem" }}
                                 variant="dark"
                                 type="submit"
                                 disabled={newComment.length === 0 || hasInvalidCharacters || newComment.length > 200}
                              >
                                 <FontAwesomeIcon icon={faShare} /> Send
                              </Button>
                           </Form>
                        )}
*/