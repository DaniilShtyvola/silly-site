import React, { CSSProperties } from "react";
import "./EaseOutWrapper.css";

interface EaseOutWrapperProps {
    children: React.ReactNode;
    show: boolean;
    duration?: number;
    style?: CSSProperties;
    direction?: "top" | "bottom";
}

const EaseOutWrapper: React.FC<EaseOutWrapperProps> = ({
    children,
    show,
    duration = 400,
    style = {},
    direction = "top",
}) => {
    return (
        <div
            style={{
                transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
                opacity: show ? 1 : 0,
                transform: show
                    ? "translateY(0)"
                    : direction === "top"
                        ? "translateY(-10px)"
                        : "translateY(10px)",
                ...style,
            }}
        >
            {children}
        </div>
    );
};

export default EaseOutWrapper;
