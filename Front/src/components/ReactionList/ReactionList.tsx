import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ReactionIcons } from "../../utils/ReactionIcons";

interface ReactionListProps {
   reactionCounts: Record<string, number>;
   myReactions: Record<string, string>;
   parentId: string;
   parentType: "post" | "comment";
   onAddReaction: (parentId: string, type: string, parentType: "post" | "comment") => void;
   onDeleteReaction: (parentId: string, reactionId: string, type: string, parentType: "post" | "comment") => void;
}

const ReactionList: React.FC<ReactionListProps> = ({
   reactionCounts,
   myReactions,
   parentId,
   parentType,
   onAddReaction,
   onDeleteReaction,
}) => {
   return (
      <>
         {Object.keys(reactionCounts).length > 0 &&
            Object.entries(reactionCounts).map(([reactionType, count], index) => {
               const icon = ReactionIcons[reactionType as keyof typeof ReactionIcons];
               if (!icon) return null;

               const isMyReaction = !!myReactions[reactionType];

               const handleReactionClick = () => {
                  if (isMyReaction) {
                     const reactionId = myReactions[reactionType];
                     onDeleteReaction(parentId, reactionId, reactionType, parentType);
                  } else {
                     onAddReaction(parentId, reactionType, parentType);
                  }
               };

               return (
                  <div
                     key={index}
                     style={{
                        marginRight: "0.4rem",
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: isMyReaction ? "rgb(43, 66, 50)" : "rgb(23, 25, 27)",
                        border: isMyReaction
                           ? "rgb(40, 167, 69) 2px solid"
                           : "rgb(33, 37, 41) 2px solid",
                        paddingInline: "6px",
                        borderRadius: "1rem",
                        color: isMyReaction ? "white" : "rgb(137, 143, 150)",
                        gap: "4px",
                        height: "26px",
                        cursor: "pointer",
                     }}
                     onClick={handleReactionClick}
                  >
                     <FontAwesomeIcon icon={icon} />
                     <p style={{ marginTop: "1px" }}>{count}</p>
                  </div>
               );
            })}
      </>
   );
};

export default ReactionList;