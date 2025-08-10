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
    const getShrinkLevel = (iconDefinition: IconDefinition): number => {
        const width = iconDefinition.icon[0] as number;
        const height = iconDefinition.icon[1] as number;
        const aspectRatio = width / height;

        switch (aspectRatio) {
            case 1.25:
                return 4.5;
            case 1.125:
                return 3.5;
            case 1:
                return 2.5;
            case 0.875:
                return 1.5;
            default:
                return aspectRatio > 1.1 ? 4.0 : 2.0;
        }
    };

    const shrinkLevel = getShrinkLevel(icon);

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
                    backgroundImage: `linear-gradient(${direction}, ${colors[0]}, ${colors[1]})`,
                    color: backgroundColor ? backgroundColor : "rgb(23, 25, 27)",
                    fontSize: size * 0.65,
                    display: "inline-block"
                }}
                transform={`shrink-${shrinkLevel}`}
            />
        </div>
    );
};

export default GradientAvatar;