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
                paddingInline: "0.3rem 0.75rem",
                cursor: "pointer",
                alignItems: "center",
                display: "flex",
            }}
            className="icon-hover"
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
