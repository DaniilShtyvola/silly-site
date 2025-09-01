import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
   faComment,
   faCircleXmark,
   faFaceSadTear,
} from "@fortawesome/free-solid-svg-icons";

import ExpandToggle from "../ExpandToggle/ExpandToggle";
import ReplyBox from "../ReplyBox/ReplyBox";
import ReactionToggleButton from "../ReactionToggleButton/ReactionToggleButton";
import EaseOutWrapper from "../EaseOutWrapper/EaseOutWrapper";
import ReactionPicker from "../ReactionPicker/ReactionPicker";
import ReactionList from "../ReactionList/ReactionList";
import Comment from "../BoardComment/BoardComment";

import type { User, Post, ParentType } from "../../models/BoardResponse";

import { formatTime } from "../../utils/FormatTime";
import { ReactionIcons } from "../../utils/ReactionIcons";

interface BoardPostProps {
    post: Post;
    users: User[];
    onToggleReaction: (parentId: string, parentType: ParentType, type: string) => void;
    onDeleteComment: (commentId: string) => void;
    onAddReply: (parentId: string, text: string, parentType: ParentType) => void;
    onEditComment: (commentId: string, text: string) => void;
    setMessage?: React.Dispatch<
        React.SetStateAction<{ text: string; variant: string; icon: IconDefinition } | null>
    >;
}

const BoardPost: React.FC<BoardPostProps> = ({ post, users, onToggleReaction, onDeleteComment, onAddReply, onEditComment, setMessage }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showNewReactionList, setShowNewReactionList] = useState(false);

    const availableReactions = Object.keys(ReactionIcons).filter(type =>
        !post.reactions.some(r => r.type === type)
    );

    const handleToggleReaction = (type: string) => {
        onToggleReaction(post.id, "post", type);
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
                {/* Control panel at the top right corner */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                }}>
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
                                borderRadius: (showNewReactionList && availableReactions.length > 0) ? "0 0.8rem 0.8rem 0" : "0.8rem",
                                position: "relative",
                                top: "-26px",
                                paddingInline: "0.1rem",
                            }}
                        >
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
                                        onSelect={(type) => onToggleReaction(post.id, "post", type)}
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
                        </div>
                    </EaseOutWrapper>
                </div>

                {/* Post content */}
                {post.sections.map((section, index) => {
                    return (
                        <div
                            key={index}
                            style={{
                                paddingTop: "4px",
                                paddingBottom: "4px",
                            }}
                        >
                            {section.type === "text" ? (
                                <p style={section.style}>
                                    {section.content}
                                </p>
                            ) : (
                                <img
                                    src={section.content}
                                    alt={`post-section-${index}`}
                                    style={section.style}
                                />
                            )}
                        </div>
                    );
                })}

                {/* Created time */}
                <p style={{
                    fontSize: "0.8rem",
                    color: "rgb(137, 143, 150)",
                }}>
                    {formatTime(post.createdAt)}
                </p>

                {/* Reaction list */}
                <div style={{
                    marginLeft: post.comments.length > 0 ? "2rem" : "0",
                }}>
                    <ReactionList
                        reactions={post.reactions}
                        onToggleReaction={handleToggleReaction}
                    />
                </div>
            </div>

            {/* Button to open replies */}
            {post.comments.length > 0 && (
                <ExpandToggle
                    isExpanded={isExpanded}
                    onToggle={() => setIsExpanded(!isExpanded)}
                    left="1.2rem"
                />
            )}

            {/* Field to write reply */}
            {isReplying && (
                <ReplyBox
                    parentType="post"
                    isLast={true}
                    isExpanded={isExpanded}
                    onAddReply={handleAddReply}
                    onCancel={() => setIsReplying(false)}
                />
            )}

            {/* Comments linked to post */}
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
                                onToggleReaction={onToggleReaction}
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

export default BoardPost;