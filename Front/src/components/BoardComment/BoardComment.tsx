import { useState, useRef, useEffect } from "react";

import { Form } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
   faComment,
   faCircleXmark,
   faFaceSadTear,
   faExclamationTriangle,
   faCircleCheck,
   faPenToSquare,
   faEraser,
} from "@fortawesome/free-solid-svg-icons";

import ExpandToggle from "../ExpandToggle/ExpandToggle";
import ReplyBox from "../ReplyBox/ReplyBox";
import ReactionToggleButton from "../ReactionToggleButton/ReactionToggleButton";
import EaseOutWrapper from "../EaseOutWrapper/EaseOutWrapper";
import ReactionPicker from "../ReactionPicker/ReactionPicker";
import ReactionList from "../ReactionList/ReactionList";
import GradientAvatar from "../GradientAvatar/GradientAvatar";
import GradientText from "../GradientText/GradientText";

import type { Comment, User, ParentType } from "../../models/BoardResponse";

import { formatTime } from "../../utils/FormatTime";
import { ReactionIcons, AvatarIcons } from "../../utils/Icons";
import { UserStyle } from "../../models/UserStyle";
import { parseStyle } from "../../utils/ParseStyle";

interface BoardCommentProps {
   comment: Comment;
   users: User[];
   isLast: boolean;
   onToggleReaction: (parentId: string, parentType: ParentType, type: string) => void;
   onDeleteComment: (commentId: string) => void;
   onAddReply: (parentId: string, text: string, parentType: ParentType) => void;
   onEditComment: (commentId: string, text: string) => void;
   setMessage?: React.Dispatch<
      React.SetStateAction<{ text: string; variant: string; icon: IconDefinition } | null>
   >;
}

const BoardComment: React.FC<BoardCommentProps> = ({ comment, users, isLast, onToggleReaction, onDeleteComment, onAddReply, onEditComment, setMessage }) => {
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

   const availableReactions = Object.keys(ReactionIcons).filter(type =>
      !comment.reactions.some(r => r.type === type)
   );

   const handleToggleReaction = (type: string) => {
      onToggleReaction(comment.id, "comment", type);
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
                           <GradientText
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

                        {/* Label to mark deleted comments */}
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

                        {/* Control panel at the top right corner */}
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
                                    borderRadius: (showNewReactionList && availableReactions.length > 0 && !isEditing)? "0 0.8rem 0.8rem 0" : "0.8rem",
                                    position: "relative",
                                    top: "-26px",
                                    paddingInline: "0.1rem",
                                 }}
                              >
                                 {isEditing ? (
                                    <>
                                       {/* Confrim and cancel edit buttons */}
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
                                       {/* Add reaction button */}
                                       {availableReactions.length > 0 && (
                                          <ReactionToggleButton onClick={() => setShowNewReactionList(!showNewReactionList)} />
                                       )}

                                       {/* Available reactions list */}
                                       {(showNewReactionList && availableReactions.length > 0) && (
                                          <div
                                             style={{
                                                position: "absolute",
                                                right: "100%",
                                             }}
                                          >
                                             <ReactionPicker
                                                availableReactions={availableReactions}
                                                onSelect={(type) => onToggleReaction(comment.id, "comment", type)}
                                             />
                                          </div>
                                       )}

                                       {/* Reply and cancel reply buttons */}
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

                                       {/* Edit and delete buttons */}
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

                     {/* Field to edit comment */}
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
                           {comment.isEdited && (
                              <span style={{ fontSize: "0.7rem", color: "rgb(137, 143, 150)" }}> (edited)</span>
                           )}
                        </p>
                     )}

                     {/* Reaction list */}
                     <ReactionList
                        reactions={comment.reactions}
                        onToggleReaction={handleToggleReaction}
                     />
                  </div>
               </div>
            </div>

            {/* Button to open replies */}
            {comment.replies.length > 0 && (
               <ExpandToggle
                  isExpanded={isExpanded}
                  onToggle={() => setIsExpanded(!isExpanded)}
                  left="3.6rem"
               />
            )}

            {/* Field to write reply */}
            {isReplying && (
               <ReplyBox
                  parentType="comment"
                  isLast={isLast}
                  isExpanded={isExpanded}
                  onAddReply={handleAddReply}
                  onCancel={() => setIsReplying(false)}
               />
            )}

            {/* Replies to this comment */}
            {(comment.replies.length > 0 && isExpanded) && (
               <div style={{
                  display: "flex",
               }}>
                  {/* Line to create branching */}
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
                           <BoardComment
                              key={reply.id}
                              comment={reply}
                              users={users}
                              isLast={isLastReply}
                              onToggleReaction={onToggleReaction}
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

export default BoardComment;