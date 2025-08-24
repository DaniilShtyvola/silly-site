import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type UserStyle = {
    avatarColors: [string, string];
    userNameColors: [string, string];
    avatarDirection: string;
    avatarIcon: IconDefinition;
};

export type UserStyleDto = {
    avatarIcon: string;
    avatarColor: string;
    avatarDirection: string;
    userNameColor: string;
};

export type UserInfoDto = {
    userName: string;
    registeredAt: string;
    commentsCount: number;
    style: UserStyleDto;
};