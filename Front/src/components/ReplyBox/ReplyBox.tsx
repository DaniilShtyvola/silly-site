import { useState } from "react";

import { Form } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleXmark,
    faShare,
    faCircleExclamation
} from "@fortawesome/free-solid-svg-icons";

interface ReplyBoxProps {
    parentType: "post" | "comment";
    isLast: boolean;
    isExpanded: boolean;
    onAddReply: (text: string) => void;
    onCancel: () => void;
}

const ReplyBox: React.FC<ReplyBoxProps> = ({
    parentType,
    isLast,
    isExpanded,
    onAddReply,
    onCancel,
}) => {
    const [replyText, setReplyText] = useState("");
    const [countWarning, setCountWarning] = useState<number | null>(null);

    const forbiddenRegex = /[ыъэё]/iu;
    const [hasInvalidCharacters, setHasInvalidCharacters] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;

        setHasInvalidCharacters(forbiddenRegex.test(input));

        if (input.length >= 300) {
            setCountWarning(400 - input.length);
        } else {
            setCountWarning(null);
        }

        setReplyText(input);
    };

    const getInterpolatedColor = (count: number): string => {
        if (count <= 0) {
            return 'rgb(137, 143, 150)';
        }

        const progress = Math.min(count / 50, 1);
        const r = Math.round(137 + (220 - 137) * progress);
        const g = Math.round(143 + (53 - 143) * progress);
        const b = Math.round(150 + (69 - 150) * progress);
        return `rgb(${r}, ${g}, ${b})`;
    };

    const handleSendClick = () => {
        const isTextValid = replyText.trim().length > 0
            && replyText.length <= 400
            && !hasInvalidCharacters;

        if (isTextValid) {
            onAddReply(replyText);
            setReplyText("");
            onCancel();
        }
    };

    return (
        <div style={{ display: "flex" }}>
            {parentType == "comment" && (
                <div
                    style={{
                        marginLeft: parentType == "comment" ? "1rem" : "2rem",
                        borderLeft: !isLast ? "rgb(49, 53, 58) 2px solid" : "none",
                        width: "2.4rem",
                        flexShrink: 0,
                    }}
                />
            )}

            <div style={{ display: "flex" }}>
                <div
                    style={{
                        marginLeft: parentType == "comment" ? "1rem" : "2rem",
                        borderLeft: isExpanded ? "rgb(49, 53, 58) 2px solid" : "none",
                        width: "1rem",
                        paddingTop: "1.4rem",
                        flexShrink: 0,
                    }}
                />

                <div
                    style={{
                        padding: "1rem",
                        backgroundColor: "rgb(33, 37, 41)",
                        marginTop: "1.4rem",
                    }}
                >
                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        height: "6px",
                    }}>
                        <div
                            style={{
                                display: "flex",
                                position: "relative",
                                backgroundColor: "rgb(33, 37, 41)",
                                border: "rgb(23, 25, 27) 2px solid",
                                color: "rgb(137, 143, 150)",
                                alignItems: "center",
                                marginLeft: "1rem",
                                height: "26px",
                                borderRadius: "0.8rem",
                                top: "-26px",
                                paddingInline: "0.1rem",
                            }}
                        >
                            {/* Cancel button */}
                            <FontAwesomeIcon
                                icon={faCircleXmark}
                                onClick={onCancel}
                                className="icon-hover"
                                style={{
                                    paddingInline: "0.3rem"
                                }}
                            />

                            {/* Send button */}
                            <FontAwesomeIcon
                                icon={faShare}
                                onClick={handleSendClick}
                                className="icon-hover"
                                style={{
                                    paddingInline: "0.3rem"
                                }}
                            />
                        </div>
                    </div>

                    {/* Text area */}
                    <Form.Control
                        as="textarea"
                        value={replyText}
                        onChange={handleInputChange}
                        placeholder="This comment might destabilize reality..."
                        style={{
                            backgroundColor: "rgb(23, 25, 27)",
                            color: "white",
                            boxSizing: "border-box",
                            resize: "both",
                            overflow: "auto",
                            minWidth: "12rem",
                            minHeight: "4rem",
                            maxWidth: "32rem",
                            maxHeight: "32rem",
                            width: "24rem"
                        }}
                    />

                    {/* Warning message */}
                    {(hasInvalidCharacters || countWarning !== null) && (
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            height: "1rem"
                        }}>
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
                                        color: getInterpolatedColor(50 - (countWarning ?? 0)),
                                        margin: "4px 0 0",
                                        fontSize: "90%",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {countWarning}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReplyBox;