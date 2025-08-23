import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ReactionIcons } from "../../utils/ReactionIcons";

interface ReactionPickerProps {
   availableReactions: string[];
   onSelect: (reactionType: string) => void;
}

const ReactionPicker: React.FC<ReactionPickerProps> = ({
   availableReactions,
   onSelect,
}) => {
   return (
      <div
         style={{
            display: "flex",
            backgroundColor: "rgb(33, 37, 41)",
            border: "rgb(23, 25, 27) 2px solid",
            borderRadius: "0.8rem 0 0 0.8rem",
            height: "26px",
            alignItems: "center",
            gap: "0.6rem",
            paddingInline: "0.4rem",
         }}
      >
         {availableReactions.map((type) => {
            const icon = ReactionIcons[type as keyof typeof ReactionIcons];
            return (
               <div
                  key={type}
                  style={{
                     cursor: "pointer",
                     display: "flex",
                     alignItems: "center",
                     color: "rgb(137, 143, 150)",
                  }}
                  onClick={() => {
                     onSelect(type);
                  }}
               >
                  <FontAwesomeIcon icon={icon} />
               </div>
            );
         })}
      </div>
   );
};

export default ReactionPicker;