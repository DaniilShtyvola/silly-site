import React from "react";

interface GradientUsernameProps {
    text: string;
    colors: [string, string];
}

const GradientUsername: React.FC<GradientUsernameProps> = ({
    text,
    colors
}) => {
    const style: React.CSSProperties =
        colors && colors[0] !== colors[1]
            ? {
                background: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                MozBackgroundClip: "text",
                display: "inline-block",
            }
            : {
                color: colors[0]
            };

    return <span style={style}>{text}</span>;
};

export default GradientUsername;
