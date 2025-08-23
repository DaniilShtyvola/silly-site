import { useEffect, useState, useRef } from "react";

import "./Board.css";

import { Form } from "react-bootstrap";

import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
   faComment,
   faEraser,
   faPenToSquare,
   faExclamationTriangle,
   faCircleXmark,
   faCircleCheck,
   faFaceLaugh,
   faFaceSadTear,
} from "@fortawesome/free-solid-svg-icons";

import GradientUsername from "../../components/GradientUsername/GradientUsername.tsx";
import GradientAvatar from "../../components/GradientAvatar/GradientAvatar.tsx";
import ExpandToggle from "../../components/ExpandToggle/ExpandToggle.tsx";
import ReplyBox from "../../components/ReplyBox/ReplyBox.tsx";
import ReactionToggleButton from "../../components/ReactionToggleButton/ReactionToggleButton.tsx";
import EaseOutWrapper from "../../components/EaseOutWrapper/EaseOutWrapper.tsx";
import ReactionPicker from "../../components/ReactionPicker/ReactionPicker.tsx";
import ReactionList from "../../components/ReactionList/ReactionList.tsx";
import FixedMessage from "../../components/FixedMessage/FixedMessage.tsx";

import type { BoardResponseDto, CommentDto, UserDto, PostWithCommentsDto } from "../../models/BoardResponse.ts";
import { UserStyle } from "../../models/UserStyle.ts";

import { formatTime } from "../../utils/FormatTime.ts";
import { parseStyle } from "../../utils/ParseStyle.ts";
import { ReactionIcons } from "../../utils/ReactionIcons";
import { updateReactionsInBoard } from "../../utils/UpdateCommentReactions.ts";
import { AvatarIcons } from "../../utils/AvatarIcons.ts";

type ParentType = "post" | "comment";

interface CommentProps {
   comment: CommentDto;
   users: UserDto[];
   isLast: boolean;
   onAddReaction: (parentId: string, type: string, parentType: ParentType) => void;
   onDeleteReaction: (parentId: string, reactionId: string, type: string, parentType: ParentType) => void;
   onDeleteComment: (commentId: string) => void;
   onAddReply: (parentId: string, text: string, parentType: ParentType) => void;
   onEditComment: (commentId: string, text: string) => void;
   setMessage?: React.Dispatch<
      React.SetStateAction<{ text: string; variant: string; icon: IconDefinition } | null>
   >;
}

const Comment: React.FC<CommentProps> = ({ comment, users, isLast, onAddReaction, onDeleteReaction, onDeleteComment, onAddReply, onEditComment, setMessage }) => {
   const [isExpanded, setIsExpanded] = useState(false);
   const [isReplying, setIsReplying] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [isHovered, setIsHovered] = useState(false);
   const [showNewReactionList, setShowNewReactionList] = useState(false);

   const [editedText, setEditedText] = useState(comment.text || "");

   const pRef = useRef<HTMLParagraphElement>(null);
   const [textareaStyle, setTextareaStyle] = useState<{ width: string; height: string }>({ width: "auto", height: "auto" });

   useEffect(() => {
      if (pRef.current) {
         const { offsetWidth, offsetHeight } = pRef.current;
         setTextareaStyle({
            width: `${offsetWidth + 20}px`,
            height: `${offsetHeight + 14}px`,
         });
      }
   }, [comment.text]);

   useEffect(() => {
      setEditedText(comment.text || "");
   }, [comment.text]);

   const [style, setStyle] = useState<UserStyle>({
      avatarColors: ["#898F96", "#898F96"],
      userNameColors: ["#898F96", "#898F96"],
      avatarDirection: "to right",
      avatarIcon: AvatarIcons["user"],
   });

   const user = users.find(u => u.id === comment.userId);

   useEffect(() => {
      if (!user && comment.isDeleted) {
         setStyle({
            avatarColors: ["#898F96", "#898F96"],
            userNameColors: ["#898F96", "#898F96"],
            avatarDirection: "to right",
            avatarIcon: AvatarIcons["xMark"],
         });
      } else if (user) {
         setStyle(parseStyle(user.style));
      }
   }, [comment, users]);

   const availableReactions = Object.keys(ReactionIcons).filter(
      (type) => !(type in comment.reactionCounts)
   );

   const handleAddReaction = (type: string) => {
      onAddReaction(comment.id, type, "comment");
   };

   const handleDeleteReaction = (reactionId: string, type: string) => {
      onDeleteReaction(comment.id, reactionId, type, "comment");
   };

   const handleAddReply = (text: string) => {
      setIsExpanded(true);
      onAddReply(comment.id, text, "comment");
   };

   const toggleReplying = () => {
      console.log("lala");
      const token = localStorage.getItem("token");

      if (!token) {
         setMessage?.({
            text: "You must be logged in to add reply.",
            variant: "danger",
            icon: faFaceSadTear,
         });
         return;
      }

      setIsReplying(prev => !prev);
   };

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
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
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
                        display: "flex",
                        justifyContent: "space-between",
                     }}>
                        <div style={{
                           display: "flex",
                           alignItems: "flex-end",
                        }}>
                           <GradientUsername
                              text={user?.userName ?? "Unknown"}
                              colors={style.userNameColors}
                           />
                           <p style={{
                              fontSize: "0.8rem",
                              color: "rgb(137, 143, 150)",
                              marginBottom: "1.5px",
                              marginLeft: "8px",
                           }}>
                              {formatTime(comment.createdAt)}
                           </p>
                        </div>

                        {(comment.isDeleted && comment.userId != null) && (
                           <p
                              style={{
                                 fontSize: "0.8rem",
                                 color: "rgb(220, 53, 69)",
                                 marginTop: "3px",
                                 marginLeft: "2rem"
                              }}
                           >
                              <FontAwesomeIcon icon={faExclamationTriangle} /> Deleted
                           </p>
                        )}

                        {!comment.isDeleted && (
                           <EaseOutWrapper
                              show={isHovered || isEditing}
                              direction="bottom"
                              style={{
                                 display: "flex",
                                 position: "relative",
                                 height: "4px",
                              }}
                           >
                              <div
                                 style={{
                                    display: "flex",
                                    backgroundColor: "rgb(33, 37, 41)",
                                    border: "rgb(23, 25, 27) 2px solid",
                                    color: "rgb(137, 143, 150)",
                                    alignItems: "center",
                                    marginLeft: "1rem",
                                    height: "26px",
                                    borderRadius: (showNewReactionList && !isEditing) ? "0 0.8rem 0.8rem 0" : "0.8rem",
                                    position: "relative",
                                    top: "-26px",
                                    paddingInline: "0.1rem",
                                 }}
                              >
                                 {isEditing ? (
                                    <>
                                       <FontAwesomeIcon
                                          icon={faCircleCheck}
                                          onClick={() => { onEditComment(comment.id, editedText); setIsEditing(false) }}
                                          className="icon-hover"
                                          style={{
                                             paddingInline: "0.3rem"
                                          }}
                                       />
                                       <FontAwesomeIcon
                                          icon={faCircleXmark}
                                          onClick={() => setIsEditing(false)}
                                          className="icon-hover"
                                          style={{
                                             paddingInline: "0.3rem"
                                          }}
                                       />
                                    </>
                                 ) : (
                                    <>
                                       {availableReactions.length > 0 && (
                                          <ReactionToggleButton onClick={() => setShowNewReactionList(!showNewReactionList)} />
                                       )}

                                       {showNewReactionList && (
                                          <div
                                             style={{
                                                position: "absolute",
                                                right: "100%",
                                             }}
                                          >
                                             <ReactionPicker
                                                availableReactions={availableReactions}
                                                onSelect={(type) => onAddReaction(comment.id, type, "comment")}
                                             />
                                          </div>
                                       )}

                                       {isReplying ? (
                                          <FontAwesomeIcon
                                             icon={faCircleXmark}
                                             onClick={() => setIsReplying(false)}
                                             className="icon-hover"
                                             style={{
                                                paddingInline: "0.3rem"
                                             }}
                                          />
                                       ) : (
                                          <FontAwesomeIcon
                                             icon={faComment}
                                             onClick={toggleReplying}
                                             className="icon-hover"
                                             style={{
                                                paddingInline: "0.3rem"
                                             }}
                                          />
                                       )}

                                       {comment.isMine && (
                                          <>
                                             <FontAwesomeIcon
                                                icon={faEraser}
                                                onClick={() => onDeleteComment(comment.id)}
                                                className="icon-hover"
                                                style={{
                                                   paddingInline: "0.3rem"
                                                }}
                                             />
                                             <FontAwesomeIcon
                                                icon={faPenToSquare}
                                                onClick={() => setIsEditing(true)}
                                                className="icon-hover"
                                                style={{
                                                   paddingInline: "0.3rem"
                                                }}
                                             />
                                          </>
                                       )}
                                    </>
                                 )}
                              </div>
                           </EaseOutWrapper>
                        )}
                     </div>

                     {isEditing ? (
                        <Form.Control
                           as="textarea"
                           value={editedText}
                           onChange={(e) => setEditedText(e.target.value)}
                           placeholder="This comment might destabilize reality..."
                           style={{
                              backgroundColor: "rgb(23, 25, 27)",
                              color: "white",
                              padding: "4px",
                              width: textareaStyle.width,
                              height: textareaStyle.height,
                              boxSizing: "border-box",
                              resize: "both",
                              overflow: "auto",
                              minWidth: "12rem",
                              minHeight: "4rem",
                              maxWidth: "32rem",
                              maxHeight: "32rem",
                           }}
                        />
                     ) : (
                        <p
                           ref={pRef}
                           style={{
                              whiteSpace: "pre-wrap",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                           }}
                        >
                           {comment.text}
                           {comment.edited && (
                              <span style={{ fontSize: "0.7rem", color: "rgb(137, 143, 150)" }}> (edited)</span>
                           )}
                        </p>
                     )}

                     <ReactionList
                        reactionCounts={comment.reactionCounts}
                        myReactions={comment.myReactions}
                        onAddReaction={handleAddReaction}
                        onDeleteReaction={handleDeleteReaction}
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
                  parentType="comment"
                  isLast={isLast}
                  isExpanded={isExpanded}
                  onAddReply={handleAddReply}
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
                              onDeleteComment={onDeleteComment}
                              onAddReply={onAddReply}
                              onEditComment={onEditComment}
                              setMessage={setMessage}
                           />
                        );
                     })}
                  </div>
               </div>
            )}
         </div>
      </div >
   );
};

interface PostProps {
   post: PostWithCommentsDto;
   users: UserDto[];
   onAddReaction: (parentId: string, type: string, parentType: ParentType) => void;
   onDeleteReaction: (parentId: string, reactionId: string, type: string, parentType: ParentType) => void;
   onDeleteComment: (commentId: string) => void;
   onAddReply: (parentId: string, text: string, parentType: ParentType) => void;
   onEditComment: (commentId: string, text: string) => void;
   setMessage?: React.Dispatch<
      React.SetStateAction<{ text: string; variant: string; icon: IconDefinition } | null>
   >;
}

const Post: React.FC<PostProps> = ({ post, users, onAddReaction, onDeleteReaction, onDeleteComment, onAddReply, onEditComment, setMessage }) => {
   const [isExpanded, setIsExpanded] = useState(false);
   const [isReplying, setIsReplying] = useState(false);
   const [isHovered, setIsHovered] = useState(false);
   const [showNewReactionList, setShowNewReactionList] = useState(false);

   const availableReactions = Object.keys(ReactionIcons).filter(
      (type) => !(type in post.reactionCounts)
   );

   const handleAddReaction = (type: string) => {
      onAddReaction(post.id, type, "post");
   };

   const handleDeleteReaction = (reactionId: string, type: string) => {
      onDeleteReaction(post.id, reactionId, type, "post");
   };

   const handleAddReply = (text: string) => {
      onAddReply(post.id, text, "post");
   };

   const toggleReplying = () => {
      const token = localStorage.getItem("token");

      if (!token) {
         setMessage?.({
            text: "You must be logged in to add reply.",
            variant: "danger",
            icon: faFaceSadTear,
         });
         return;
      }

      setIsReplying(prev => !prev);
   };

   return (
      <div key={post.id}>
         <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
               backgroundColor: "rgb(33, 37, 41)",
               padding: "1rem 20px",
               marginTop: "2rem"
            }}
         >
            <div style={{
               display: "flex",
               justifyContent: "space-between",
            }}>
               <h4>{post.title}</h4>

               <EaseOutWrapper
                  show={isHovered}
                  direction="bottom"
                  style={{
                     display: "flex",
                     position: "relative",
                     height: "4px",
                  }}
               >
                  <div
                     style={{
                        display: "flex",
                        backgroundColor: "rgb(33, 37, 41)",
                        border: "rgb(23, 25, 27) 2px solid",
                        color: "rgb(137, 143, 150)",
                        alignItems: "center",
                        marginLeft: "1rem",
                        height: "26px",
                        borderRadius: showNewReactionList ? "0 0.8rem 0.8rem 0" : "0.8rem",
                        position: "relative",
                        top: "-26px",
                        paddingInline: "0.1rem",
                     }}
                  >
                     {availableReactions.length > 0 && (
                        <ReactionToggleButton onClick={() => setShowNewReactionList(!showNewReactionList)} />
                     )}

                     {showNewReactionList && (
                        <div
                           style={{
                              position: "absolute",
                              right: "100%",
                           }}
                        >
                           <ReactionPicker
                              availableReactions={availableReactions}
                              onSelect={(type) => onAddReaction(post.id, type, "post")}
                           />
                        </div>
                     )}

                     {isReplying ? (
                        <FontAwesomeIcon
                           icon={faCircleXmark}
                           onClick={() => setIsReplying(false)}
                           className="icon-hover"
                           style={{
                              paddingInline: "0.3rem"
                           }}
                        />
                     ) : (
                        <FontAwesomeIcon
                           icon={faComment}
                           onClick={toggleReplying}
                           className="icon-hover"
                           style={{
                              paddingInline: "0.3rem"
                           }}
                        />
                     )}
                  </div>
               </EaseOutWrapper>
            </div>

            <p>{post.content}</p>
            <p style={{
               fontSize: "0.8rem",
               color: "rgb(137, 143, 150)",
            }}>
               {formatTime(post.createdAt)}
            </p>

            <div style={{
               marginLeft: "2rem"
            }}>
               <ReactionList
                  reactionCounts={post.reactionCounts}
                  myReactions={post.myReactions}
                  onAddReaction={handleAddReaction}
                  onDeleteReaction={handleDeleteReaction}
               />
            </div>
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
               parentType="post"
               isLast={true}
               isExpanded={isExpanded}
               onAddReply={handleAddReply}
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
                        onDeleteComment={onDeleteComment}
                        onAddReply={onAddReply}
                        onEditComment={onEditComment}
                        setMessage={setMessage}
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

   const [message, setMessage] = useState<{
      text: string;
      variant: string;
      icon: IconDefinition;
   } | null>(null);

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
   }, []);

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

            const markDeleted = (comments: CommentDto[]): CommentDto[] => {
               return comments.map(c => {
                  if (c.id === commentId) {
                     return { ...c, isDeleted: true };
                  }
                  return { ...c, replies: markDeleted(c.replies) };
               });
            };

            return {
               ...prev,
               posts: prev.posts.map(post => ({
                  ...post,
                  comments: markDeleted(post.comments)
               }))
            };
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
                     return { ...c, replies: [newComment, ...c.replies] };
                  }
                  return { ...c, replies: addReply(c.replies) };
               });
            };

            return {
               ...prev,
               posts: prev.posts.map(post => {
                  if (parentType === "post" && post.id === parentId) {
                     return { ...post, comments: [newComment, ...post.comments] };
                  }
                  return { ...post, comments: addReply(post.comments) };
               }),
            };
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

   const handleAddReaction = async (parentId: string, type: string, parentType: ParentType) => {
      const token = localStorage.getItem("token");

      if (!token) {
         setMessage({
            text: "You must be logged in to add reaction.",
            variant: "danger",
            icon: faFaceSadTear,
         });
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

         setMessage({
            text: "Successfully added reaction!",
            variant: "success",
            icon: faFaceLaugh,
         });

      } catch (err) {
         console.error("Failed to add reaction:", err);

         setMessage({
            text: "Failed to add reaction.",
            variant: "danger",
            icon: faFaceSadTear,
         });
      }
   };

   const handleDeleteReaction = async (parentId: string, reactionId: string, type: string, parentType: ParentType) => {
      const token = localStorage.getItem("token");

      if (!token) {
         setMessage({
            text: "You must be logged in to delete reaction.",
            variant: "danger",
            icon: faFaceSadTear,
         });
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

         setMessage({
            text: "Successfully deleted reaction!",
            variant: "success",
            icon: faFaceLaugh,
         });

      } catch (err) {
         console.error("Failed to delete reaction:", err);

         setMessage({
            text: "Failed to delete reaction.",
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
         const response = await axios.put(`${API_URL}/board/comments/${commentId}`, { text }, {
            headers: { Authorization: `Bearer ${token}` },
         });

         const updatedComment: CommentDto = response.data;

         setBoardData(prev => {
            if (!prev) return prev;

            const updateComment = (comments: CommentDto[]): CommentDto[] => {
               return comments.map(c => {
                  if (c.id === commentId) {
                     return { ...c, text: updatedComment.text, edited: updatedComment.edited };
                  }
                  return { ...c, replies: updateComment(c.replies) };
               });
            };

            return {
               ...prev,
               posts: prev.posts.map(post => ({
                  ...post,
                  comments: updateComment(post.comments)
               })),
            };
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
                  onDeleteComment={handleDeleteComment}
                  onAddReply={handleAddReply}
                  onEditComment={handleEditComment}
                  setMessage={setMessage}
               />
            ))}

         <FixedMessage
            message={message}
            onClose={() => setMessage(null)}
         />
      </div>
   );
};

export default Board;