import React from "react";
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
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(48px, 1fr))",
            gap: "8px"
        }}>
            {Object.entries(AvatarIcons)
                .filter(([key, icon]) => !excludedIcons.has(icon))
                .map(([key, icon]) => (
                    <div
                        key={key}
                        onClick={() => onSelect(icon)}
                        style={{
                            cursor: "pointer",
                            padding: "8px",
                            borderRadius: "6px",
                            border: icon === selectedIcon ? "2px solid #4caf50" : "2px solid transparent",
                            backgroundColor: icon === selectedIcon ? "rgba(76, 175, 80, 0.2)" : "transparent",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        title={key}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(icon); }}
                    >
                        <FontAwesomeIcon
                            style={{ 
                                color: icon === selectedIcon ? "white" : "rgb(100, 105, 111)",
                                fontSize: "1.1rem"
                            }}
                            icon={icon}
                        />
                    </div>
                ))}
        </div>
    );
};

export default AvatarIconPicker;
