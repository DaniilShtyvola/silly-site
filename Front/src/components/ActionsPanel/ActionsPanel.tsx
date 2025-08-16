import { RefObject } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComment,
    faFaceMehBlank,
    faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";

import ReactionList from "../ReactionList/ReactionList";
import ReactionPicker from "../ReactionPicker/ReactionPicker";

type ParentType = "comment" | "post";

interface ActionsPanelProps {
    availableReactions: string[];
    parentId: string;
    parentType: ParentType;
    reactionWrapperRef: RefObject<HTMLDivElement | null>;
    showNewReactionList: boolean;
    setShowNewReactionList: (show: boolean) => void;
    reactions: {
        reactionCounts: Record<string, number>;
        myReactions: Record<string, string>;
    };
    onAddReaction: (parentId: string, type: string, parentType: "post" | "comment") => void;
    onDeleteReaction: (parentId: string, reactionId: string, type: string, parentType: "post" | "comment") => void;
    isReplying: boolean;
    setIsReplying: (replying: boolean) => void;
    style?: React.CSSProperties;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({
    availableReactions,
    parentId,
    parentType,
    reactionWrapperRef,
    showNewReactionList,
    setShowNewReactionList,
    reactions,
    onAddReaction,
    onDeleteReaction,
    isReplying,
    setIsReplying,
    style,
}) => {
    return (
        <div
            style={{
                display: "flex",
                position: "relative",
                height: "4px",
                ...style,
            }}
        >
            {availableReactions.length > 0 && (
                <div style={{
                    position: "relative",
                    display: "inline-block"
                }}>
                    <div
                        style={{
                            display: "flex",
                            backgroundColor: "rgb(33, 37, 41)",
                            border: "rgb(33, 37, 41) 2px solid",
                            color: "rgb(137, 143, 150)",
                            paddingInline: "6px",
                            borderRadius: "1rem",
                            alignItems: "center",
                            cursor: "pointer",
                            marginRight: "0.4rem",
                            height: "26px",
                        }}
                        onClick={() => setShowNewReactionList(!showNewReactionList)}
                    >
                        <FontAwesomeIcon
                            icon={faFaceMehBlank}
                            style={{
                                borderRadius: "1rem",
                                paddingRight: "8px",
                            }}
                        />
                        <div style={{ position: "absolute" }}>
                            <FontAwesomeIcon
                                icon={faCirclePlus}
                                style={{
                                    fontSize: "0.8rem",
                                    position: "relative",
                                    top: "6px",
                                    left: "10px",
                                    backgroundColor: "rgb(33, 37, 41)",
                                    border: "rgb(33, 37, 41) 2px solid",
                                    borderRadius: "1rem",
                                }}
                            />
                        </div>
                    </div>

                    {showNewReactionList && (
                        <ReactionPicker
                            availableReactions={availableReactions}
                            onSelect={(type) => onAddReaction(parentId, type, parentType)}
                            onClose={() => setShowNewReactionList(false)}
                            wrapperRef={reactionWrapperRef}
                        />
                    )}
                </div>
            )}

            <ReactionList
                reactionCounts={reactions.reactionCounts}
                myReactions={reactions.myReactions as Record<string, string>}
                parentId={parentId}
                parentType={parentType}
                onAddReaction={onAddReaction}
                onDeleteReaction={onDeleteReaction}
            />

            <div
                style={{
                    display: "flex",
                    backgroundColor: "rgb(33, 37, 41)",
                    border: "rgb(33, 37, 41) 2px solid",
                    color: "rgb(137, 143, 150)",
                    paddingInline: "6px",
                    borderRadius: "1rem",
                    alignItems: "center",
                    cursor: "pointer",
                    marginLeft: "1rem",
                    height: "26px",
                }}
                onClick={() => setIsReplying(!isReplying)}
            >
                <FontAwesomeIcon
                    icon={faComment}
                    style={{
                        fontSize: "1.2rem",
                        borderRadius: "1rem",
                        marginRight: "0.4rem",
                    }}
                />
                <p>Reply</p>
            </div>
        </div>
    );
};

export default ActionsPanel;