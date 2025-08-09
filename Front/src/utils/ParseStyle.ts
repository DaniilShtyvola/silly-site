import { UserStyle, UserStyleDto } from "../models/UserStyle";

import { AvatarIcons } from "./AvatarIcons";

const parseColors = (colorString: string): [string, string] => {
    const parts = colorString.split(",").map(c => c.trim());
    const color1 = parts[0] ? (parts[0].startsWith("#") ? parts[0] : `#${parts[0]}`) : "#000000";
    const color2 = parts[1] ? (parts[1].startsWith("#") ? parts[1] : `#${parts[1]}`) : color1;
    return [color1, color2];
};

export const parseStyle = (style: UserStyleDto): UserStyle => {
    const avatarColors = parseColors(style.avatarColor);
    const userNameColors = parseColors(style.userNameColor);
    const avatarDirection = style.avatarDirection || "to right";

    const iconKey = style.avatarIcon?.toLowerCase() || "user";
    const avatarIcon = AvatarIcons[iconKey] || AvatarIcons["user"];

    return {
        avatarColors,
        userNameColors,
        avatarDirection,
        avatarIcon,
    };
};