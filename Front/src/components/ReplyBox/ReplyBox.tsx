import { useState } from "react";

import { Form } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faShare,
    faCircleExclamation
} from "@fortawesome/free-solid-svg-icons";

interface ReplyBoxProps {
    parentId: string;
    parentType: "post" | "comment";
    isLast: boolean;
    isExpanded: boolean;
    onAddReply: (parentId: string, text: string, parentType: "post" | "comment") => void;
    onCancel: () => void;
}

const ReplyBox: React.FC<ReplyBoxProps> = ({
    parentId,
    parentType,
    isLast,
    isExpanded,
    onAddReply,
    onCancel,
}) => {
    const [replyText, setReplyText] = useState("");
    const allowedRegex = /^[0-9A-Za-zА-ЩЬЮЯҐЄІЇа-щьюяґєії !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~\n\r\t]*$/u;
    const [hasInvalidCharacters, setHasInvalidCharacters] = useState(false);
    const [countWarning, setCountWarning] = useState<number | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;

        setHasInvalidCharacters(!allowedRegex.test(input));

        if (input.length >= 150) {
            setCountWarning(200 - input.length);
        } else {
            setCountWarning(null);
        }

        setReplyText(input);
    };

    const getInterpolatedColor = (count: number): string => {
        const progress = Math.min((count - 150) / 50, 1);
        const r = Math.round(128 + (220 - 128) * progress);
        const g = Math.round(128 + (53 - 128) * progress);
        const b = Math.round(128 + (69 - 128) * progress);
        return `rgb(${r}, ${g}, ${b})`;
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
                    <Form.Control
                        as="textarea"
                        value={replyText}
                        onChange={handleInputChange}
                        placeholder="This comment might destabilize reality..."
                        style={{
                            backgroundColor: "rgb(23, 25, 27)",
                            color: "white",
                            width: "340px",
                            maxHeight: "280px",
                            height: "120px"
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

                    <div
                        style={{
                            display: "flex",
                            position: "relative",
                            height: "6px",
                            top: "6px",
                            justifyContent: "flex-end",
                        }}
                    >
                        {/* Cancel button */}
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
                            onClick={onCancel}
                        >
                            <FontAwesomeIcon
                                icon={faXmark}
                                style={{
                                    fontSize: "1.2rem",
                                    borderRadius: "1rem",
                                }}
                            />
                        </div>

                        {/* Send button */}
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
                            onClick={() => {
                                if (replyText.trim().length > 0 && !hasInvalidCharacters) {
                                    onAddReply(parentId, replyText, parentType);
                                    setReplyText("");
                                    onCancel();
                                }
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faShare}
                                style={{
                                    fontSize: "1.2rem",
                                    borderRadius: "1rem",
                                    marginRight: "0.4rem",
                                }}
                            />
                            <p>Send</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReplyBox;