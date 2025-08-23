import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceMehBlank, faCirclePlus } from "@fortawesome/free-solid-svg-icons";

interface ReactionToggleButtonProps {
    onClick: () => void;
}

const ReactionToggleButton: React.FC<ReactionToggleButtonProps> = ({ onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                position: "relative",
                paddingRight: "0.45rem",
                cursor: "pointer",
                alignItems: "center",
                display: "flex",
            }}
        >
            <FontAwesomeIcon
                icon={faFaceMehBlank}
            />
            <div style={{ position: "absolute" }}>
                <FontAwesomeIcon
                    icon={faCirclePlus}
                    style={{
                        fontSize: "0.6rem",
                        position: "relative",
                        top: "5px",
                        left: "10px",
                        backgroundColor: "rgb(33, 37, 41)",
                        border: "rgb(33, 37, 41) 2px solid",
                        borderRadius: "1rem",
                    }}
                />
            </div>
        </div>
    );
};

export default ReactionToggleButton;
