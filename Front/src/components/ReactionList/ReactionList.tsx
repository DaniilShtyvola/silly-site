import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactionIcons } from "../../utils/Icons.ts";
import type { Reaction } from "../../models/BoardResponse.ts";

interface ReactionListProps {
    reactions: Reaction[];
    onToggleReaction: (type: string) => void;
}

const ReactionList: React.FC<ReactionListProps> = ({ reactions, onToggleReaction }) => {
    const [hoveredMap, setHoveredMap] = useState<Record<string, boolean>>({});

    const handleMouseEnter = (type: string) => {
        setHoveredMap(prev => ({ ...prev, [type]: true }));
    };

    const handleMouseLeave = (type: string) => {
        setHoveredMap(prev => ({ ...prev, [type]: false }));
    };

    return (
        <div style={{ height: "0px" }}>
            <div
                style={{
                    display: "inline-flex",
                    gap: "0.4rem",
                    backgroundColor: "rgb(33, 37, 41)",
                    borderRadius: "0.8rem",
                    position: "relative",
                    top: "2px",
                    border: "rgb(23, 25, 27) 2px solid",
                }}
            >
                {reactions.map(r => {
                    const icon = ReactionIcons[r.type as keyof typeof ReactionIcons];
                    if (!icon) return null;

                    const isHovered = !!hoveredMap[r.type];

                    const handleClick = () => {
                        onToggleReaction(r.type);
                    };

                    const color = r.isMine
                        ? isHovered
                            ? "rgb(186, 191, 196)"
                            : "white"
                        : isHovered
                            ? "rgb(186, 191, 196)"
                            : "rgb(137, 143, 150)";

                    return (
                        <div
                            key={r.type}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: r.isMine ? "rgb(43, 66, 50)" : "rgb(33, 37, 41)",
                                border: r.isMine
                                    ? "rgb(40, 167, 69) 2px solid"
                                    : "rgb(33, 37, 41) 2px solid",
                                paddingInline: "3px",
                                borderRadius: "0.8rem",
                                gap: "2px",
                                height: "22px",
                                cursor: "pointer",
                                color,
                                transition: "color 0.2s ease",
                            }}
                            onClick={handleClick}
                            onMouseEnter={() => handleMouseEnter(r.type)}
                            onMouseLeave={() => handleMouseLeave(r.type)}
                        >
                            <FontAwesomeIcon icon={icon} />
                            <p style={{ marginTop: "1px" }}>{r.count}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReactionList;
