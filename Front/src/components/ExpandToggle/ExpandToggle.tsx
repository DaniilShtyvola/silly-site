import "./ExpandToggle.css"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faCircleChevronDown,
   faCircleChevronUp,
} from "@fortawesome/free-solid-svg-icons";

interface ExpandToggleProps {
   isExpanded: boolean;
   onToggle: () => void;
   left?: string;
}

const ExpandToggle: React.FC<ExpandToggleProps> = ({ isExpanded, onToggle, left = "0rem" }) => {
   return (
      <div style={{ position: "absolute" }}>
         <FontAwesomeIcon
            icon={isExpanded ? faCircleChevronUp : faCircleChevronDown}
            style={{
               fontSize: "1.2rem",
               position: "relative",
               backgroundColor: "rgb(23, 25, 27)",
               padding: "4px",
               left: left,
               top: "-0.8rem",
               borderRadius: "1rem",
            }}
            onClick={onToggle}
            className="expand-toggle-hover"
         />
      </div>
   );
};

export default ExpandToggle;