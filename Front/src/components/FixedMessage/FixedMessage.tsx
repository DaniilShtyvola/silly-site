import { FC, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type FixedMessageProps = {
    message: {
        text: string;
        variant: string;
        icon?: IconDefinition;
    } | null;
    duration?: number;
    fadeDuration?: number;
    onClose?: () => void;
};

const FixedMessage: FC<FixedMessageProps> = ({ message, duration = 3000, fadeDuration = 1000, onClose }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        if (message) {
            const fadeOutTimer = setTimeout(() => setIsFadingOut(true), duration);
            const removeMessageTimer = setTimeout(() => {
                setIsFadingOut(false);
                onClose?.();
            }, duration + fadeDuration);

            return () => {
                clearTimeout(fadeOutTimer);
                clearTimeout(removeMessageTimer);
            };
        }
    }, [message, duration, fadeDuration, onClose]);

    if (!message) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: "20px",
                left: "20px",
                zIndex: 9999,
                transition: `opacity ${fadeDuration / 1000}s, transform ${fadeDuration / 1000}s ease`,
                opacity: isFadingOut ? 0 : 1,
                transform: isFadingOut ? "translateY(20px)" : "translateY(0)",
            }}
        >
            <Alert
                style={{
                    marginBottom: 0,
                    backgroundColor: message.variant === "success" ? "rgb(40, 167, 69)" : "rgb(220, 53, 69)",
                    color: "white",
                    border: "1px solid rgb(33, 37, 41)",
                    textAlign: "left",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                }}
            >
                {message.icon && <FontAwesomeIcon icon={message.icon} style={{ marginRight: 8 }} />}
                {message.text}
            </Alert>
        </div>
    );
};

export default FixedMessage;
