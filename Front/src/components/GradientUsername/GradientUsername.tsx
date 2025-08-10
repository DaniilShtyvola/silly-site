import React from "react";
import "./GradientUsername.css";

interface GradientUsernameProps {
    text: string;
    colors: [string, string];
    className?: string;
}

const GradientUsername: React.FC<GradientUsernameProps> = ({
    text,
    colors,
    className = ""
}) => {
    if (!text || text.trim() === '') {
        return null;
    }

    const isGradient = colors && colors[0] !== colors[1];

    return (
        <span
            className={`gradient-username ${isGradient ? 'gradient-text' : 'solid-text'} ${className}`}
            style={{
                '--gradient-start': colors[0],
                '--gradient-end': colors[1] || colors[0]
            } as React.CSSProperties}
        >
            {text}
        </span>
    );
};

export default GradientUsername;
