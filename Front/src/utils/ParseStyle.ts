import { UserStyle, UserStyleDto } from "../models/UserStyle";

import { AvatarIcons } from "./AvatarIcons";

const parseColors = (colorString: string): [string, string] => {
    const parts = colorString.split(",").map(c => c.trim());
    const color1 = parts[0] ? (parts[0].startsWith("#") ? parts[0] : `#${parts[0]}`) : "#000000";
    const color2 = parts[1] ? (parts[1].startsWith("#") ? parts[1] : `#${parts[1]}`) : color1;
    return [color1, color2];
};

function snakeToCamel(s: string): string {
    return s.toLowerCase().replace(/(_\w)/g, m => m[1].toUpperCase());
}

function camelToSnake(s: string): string {
    return s.replace(/([A-Z])/g, "_$1").toLowerCase();
}

export const parseStyle = (style: UserStyleDto): UserStyle => {
    const avatarColors = parseColors(style.avatarColor);
    const userNameColors = parseColors(style.userNameColor);
    const avatarDirection = style.avatarDirection || "to right";

    const iconKey = style.avatarIcon ? snakeToCamel(style.avatarIcon) : "user";
    const avatarIcon =
        iconKey in AvatarIcons
            ? AvatarIcons[iconKey as keyof typeof AvatarIcons]
            : AvatarIcons["user"];

    return {
        avatarColors,
        userNameColors,
        avatarDirection,
        avatarIcon,
    };
};

export const serializeStyle = (style: UserStyle): UserStyleDto => {
    const stripHash = (color: string) => color.replace(/^#/, "");

    return {
        avatarIcon: camelToSnake(
            Object.keys(AvatarIcons).find(
                key => AvatarIcons[key as keyof typeof AvatarIcons] === style.avatarIcon
            ) || "user"
        ),
        avatarColor: style.avatarColors.map(stripHash).join(", "),
        avatarDirection: style.avatarDirection,
        userNameColor: style.userNameColors.map(stripHash).join(", "),
    };
};