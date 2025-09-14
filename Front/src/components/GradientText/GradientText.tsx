import React from "react";

import "./GradientText.css";

interface GradientTextProps {
    text: string;
    colors: [string, string];
    className?: string;
}

const GradientText: React.FC<GradientTextProps> = ({
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

export default GradientText;
