import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactionIcons } from "../../utils/ReactionIcons";

interface ReactionListProps {
   reactionCounts: Record<string, number>;
   myReactions: Record<string, string>;
   onAddReaction: (type: string) => void;
   onDeleteReaction: (reactionId: string, type: string) => void;
}

const ReactionList: React.FC<ReactionListProps> = ({
   reactionCounts,
   myReactions,
   onAddReaction,
   onDeleteReaction,
}) => {
   // Хуки тепер на верхньому рівні
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
            {Object.entries(reactionCounts).map(([reactionType, count]) => {
               const icon = ReactionIcons[reactionType as keyof typeof ReactionIcons];
               if (!icon) return null;

               const isMyReaction = !!myReactions[reactionType];
               const isHovered = !!hoveredMap[reactionType];

               const handleReactionClick = () => {
                  if (isMyReaction) {
                     const reactionId = myReactions[reactionType];
                     onDeleteReaction(reactionId, reactionType);
                  } else {
                     onAddReaction(reactionType);
                  }
               };

               const color = isMyReaction
                  ? isHovered
                     ? "rgb(186, 191, 196)"
                     : "white"
                  : isHovered
                     ? "rgb(186, 191, 196)"
                     : "rgb(137, 143, 150)";

               return (
                  <div
                     key={reactionType}
                     style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: isMyReaction ? "rgb(43, 66, 50)" : "rgb(33, 37, 41)",
                        border: isMyReaction
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
                     onClick={handleReactionClick}
                     onMouseEnter={() => handleMouseEnter(reactionType)}
                     onMouseLeave={() => handleMouseLeave(reactionType)}
                  >
                     <FontAwesomeIcon icon={icon} />
                     <p style={{ marginTop: "1px" }}>{count}</p>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default ReactionList;
