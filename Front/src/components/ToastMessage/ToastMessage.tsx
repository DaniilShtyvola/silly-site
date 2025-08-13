import { FC, useEffect, useState } from "react";

import { Alert } from "react-bootstrap";

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ToastMessageProps = {
    message: {
        text: string;
        variant: string;
        icon?: IconDefinition;
    } | null;
    duration?: number;
    fadeDuration?: number;
    onClose?: () => void;
};

const ToastMessage: FC<ToastMessageProps> = ({ message, duration = 3000, fadeDuration = 1000, onClose }) => {
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
        <Alert
            style={{
                opacity: isFadingOut ? 0 : 1,
                maxHeight: isFadingOut ? 0 : "100px",
                padding: isFadingOut ? "0" : "8px",
                marginBottom: 0,
                overflow: "hidden",
                textAlign: "center",
                transition: `opacity ${fadeDuration / 1000}s, max-height ${fadeDuration / 1000}s ease, padding ${fadeDuration / 1000}s ease, margin ${(fadeDuration + 500) / 1000}s ease`,
                backgroundColor: message.variant === "success" ? "rgb(40, 167, 69)" : "rgb(220, 53, 69)",
                color: "white",
                border: "1px solid rgb(33, 37, 41)",
                flex: "1",
            }}
        >
            {message.icon && <FontAwesomeIcon icon={message.icon} style={{ marginRight: 6 }} />}
            {message.text}
        </Alert>
    );
};

export default ToastMessage;