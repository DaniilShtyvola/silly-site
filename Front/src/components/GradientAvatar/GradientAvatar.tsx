import React from "react";

import "./GradientAvatar.css";

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSquareFull
} from "@fortawesome/free-solid-svg-icons";

interface GradientAvatarProps {
    icon: IconDefinition;
    colors: [string, string];
    direction?: string;
    size?: number;
    backgroundColor?: string;
}

const GradientAvatar: React.FC<GradientAvatarProps> = ({
    icon,
    colors,
    direction = "to right",
    size = 40,
    backgroundColor
}) => {
    return (
        <div
            className="avatar-gradient-border"
            style={{
                "--border-gradient-start": colors[0],
                "--border-gradient-end": colors[1],
                "--border-gradient-direction": direction,
                "--border-padding": `${size * 0.05}px`,
                width: size,
                height: size,
            } as React.CSSProperties}
        >
            <FontAwesomeIcon
                icon={icon}
                mask={faSquareFull}
                style={{
                    backgroundImage: `linear-gradient(${direction}, ${ colors[0]}, ${ colors[1]})`,
                    color: backgroundColor ? backgroundColor : "rgb(23, 25, 27)",
                    fontSize: size * 0.50,
                    display: "inline-block"
                }}
            />
        </div>
    );
};

export default GradientAvatar;
