import { ForwardedRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ReactionIcons } from "../../utils/ReactionIcons";

interface ReactionPickerProps {
   availableReactions: string[];
   onSelect: (reactionType: string) => void;
   onClose: () => void;
   wrapperRef?: ForwardedRef<HTMLDivElement>;
}

const ReactionPicker: React.FC<ReactionPickerProps> = ({
   availableReactions,
   onSelect,
   onClose,
   wrapperRef,
}) => {
   return (
      <div
         style={{
            position: "absolute",
            top: "2rem",
            zIndex: 1000,
         }}
         ref={wrapperRef}
      >
         <div
            style={{
               backgroundColor: "rgb(33, 37, 41)",
               border: "2px solid rgb(23, 25, 27)",
               borderRadius: "1rem",
               padding: "0.5rem",
               display: "flex",
               gap: "0.6rem",
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
                        fontSize: "1.2rem",
                     }}
                     onClick={() => {
                        onSelect(type);
                        onClose();
                     }}
                  >
                     <FontAwesomeIcon icon={icon} />
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default ReactionPicker;