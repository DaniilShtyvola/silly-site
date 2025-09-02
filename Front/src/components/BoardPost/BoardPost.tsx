import { useState } from "react";

import "./BoardPost.css";

import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    faComment,
    faCircleXmark,
    faFaceSadTear,
    faBullhorn
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
import { ReactionIcons, CategoryIcons } from "../../utils/Icons";

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

    const categoryIcon =
        post.category in CategoryIcons
            ? CategoryIcons[post.category as keyof typeof CategoryIcons]
            : faBullhorn;

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
                            height: "0",
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
                    const isFirst = index === 0;
                    const isLast = index === post.sections.length - 1;

                    if (section.type === "text") {
                        const parts = section.content.split(/(\[.*?\]\(.*?\))/g);

                        return (
                            <div
                                key={index}
                                style={{
                                    paddingTop: isFirst ? 0 : "4px",
                                    paddingBottom: isLast ? 0 : "4px",
                                }}
                            >
                                <p style={section.style}>
                                    {parts.map((part, i) => {
                                        const match = part.match(/\[(.*?)\]\((.*?)\)/);
                                        if (match) {
                                            const [, text, href] = match;
                                            return (
                                                <OverlayTrigger
                                                    key={i}
                                                    placement="bottom-start"
                                                    delay={{ show: 1000, hide: 0 }}
                                                    overlay={
                                                        <Tooltip id={`tooltip-${i}`}>
                                                            {href.length > 30 ? href.slice(0, 30) + "..." : href}
                                                        </Tooltip>
                                                    }
                                                >
                                                    <a
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="link"
                                                    >
                                                        {text}
                                                    </a>
                                                </OverlayTrigger>
                                            );
                                        }
                                        return <span key={i}>{part}</span>;
                                    })}
                                </p>
                            </div>
                        );
                    } else {
                        return (
                            <div
                                key={index}
                                style={{
                                    paddingTop: isFirst ? 0 : "4px",
                                    paddingBottom: isLast ? 0 : "4px",
                                }}
                            >
                                <img
                                    src={section.content}
                                    alt={`post-section-${index}`}
                                    style={section.style}
                                />
                            </div>
                        );
                    }
                })}

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "rgb(137, 143, 150)",
                }}>
                    {/* Created time */}
                    <p style={{
                        fontSize: "0.8rem",
                        marginTop: "4px",
                        marginBottom: "4px",
                    }}>
                        {formatTime(post.createdAt, true)}
                    </p>

                    {/* Category with icon */}
                    <div style={{
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                    }}>
                        <FontAwesomeIcon icon={categoryIcon} />
                        <p>
                            {post.category}
                        </p>
                    </div>
                </div>

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