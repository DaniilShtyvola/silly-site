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
               color: "rgb(49, 53, 58)",
               position: "relative",
               backgroundColor: "rgb(23, 25, 27)",
               padding: "4px",
               left: left,
               top: "-0.8rem",
               borderRadius: "1rem",
               cursor: "pointer",
            }}
            onClick={onToggle}
         />
      </div>
   );
};

export default ExpandToggle;