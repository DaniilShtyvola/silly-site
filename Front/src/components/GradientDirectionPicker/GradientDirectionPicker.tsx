import React from "react";
import { UserStyle } from "../../models/UserStyle";
import "./GradientDirectionPicker.css";

const GradientDirectionPicker = ({ style, setStyle }: {
    style: UserStyle,
    setStyle: React.Dispatch<React.SetStateAction<UserStyle>>
}) => {
    const extractAngle = (dir: string): number => {
        const match = dir.match(/^(\d+)deg$/);
        if (match) return parseInt(match[1], 10);
        switch (dir) {
            case "to right": return 90;
            case "to left": return 270;
            case "to bottom": return 180;
            case "to top": return 0;
            case "to top right": return 45;
            case "to bottom right": return 135;
            case "to bottom left": return 225;
            case "to top left": return 315;
            default: return 90;
        }
    };

    const [angle, setAngle] = React.useState(extractAngle(style.avatarDirection));

    React.useEffect(() => {
        setStyle(prev => ({
            ...prev,
            avatarDirection: `${angle}deg`,
        }));
    }, [angle, setStyle]);

    return (
        <div className="custom-slider-container">
            <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={e => setAngle(Number(e.target.value))}
                className="custom-slider"
            />
        </div>
    );
};

export default GradientDirectionPicker;