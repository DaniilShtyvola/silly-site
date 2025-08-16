import { UserStyleDto } from "./UserStyle";

export type UserDto = {
    id: string;
    userName: string;
    style: UserStyleDto;
};

export type CommentDto = {
    id: string;
    userId: string;
    text: string | null;
    createdAt: string;
    edited: string | null;
    reactionCounts: Record<string, number> | {};
    myReactions: Record<string, string> | {};
    replies: CommentDto[];
};

export type PostWithCommentsDto = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    reactionCounts: Record<string, number> | {};
    myReactions: Record<string, string> | {};
    comments: CommentDto[];
};

export type BoardResponseDto = {
    posts: PostWithCommentsDto[];
    users: UserDto[];
    totalPosts: number;
};
