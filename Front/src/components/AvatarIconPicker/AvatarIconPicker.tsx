import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { AvatarIcons } from "../../utils/AvatarIcons";

type AvatarIconPickerProps = {
    selectedIcon: IconDefinition;
    onSelect: (icon: IconDefinition) => void;
};

const excludedIcons = new Set([
    AvatarIcons.user,
    AvatarIcons.star
]);

const AvatarIconPicker: React.FC<AvatarIconPickerProps> = ({ selectedIcon, onSelect }) => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px"
            }}
        >
            {Object.entries(AvatarIcons)
                .filter(([_, icon]) => !excludedIcons.has(icon))
                .map(([key, icon]) => {
                    const [hovered, setHovered] = useState(false);

                    const getColor = () => {
                        if (icon === selectedIcon) {
                            return hovered ? "rgb(186, 191, 196)" : "white";
                        }
                        return hovered ? "rgb(137, 143, 150)" : "rgb(100, 105, 111)";
                    };

                    return (
                        <div
                            key={key}
                            onClick={() => onSelect(icon)}
                            style={{
                                cursor: "pointer",
                                padding: "6.5px",
                                borderRadius: "6px",
                                border:
                                    icon === selectedIcon
                                        ? "2px solid #4caf50"
                                        : "2px solid transparent",
                                backgroundColor:
                                    icon === selectedIcon
                                        ? "rgba(76, 175, 80, 0.2)"
                                        : "transparent",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: getColor()
                            }}
                            title={key}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") onSelect(icon);
                            }}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                        >
                            <FontAwesomeIcon
                                icon={icon}
                                style={{
                                    transition: "color 0.2s ease",
                                    fontSize: "1.1rem"
                                }}
                            />
                        </div>
                    );
                })}
        </div>
    );
};

export default AvatarIconPicker;
