import { UserStyleDto } from "./UserStyle";

export type User = {
    id: string;
    userName: string;
    style: UserStyleDto;
};

export type Comment = {
    id: string;
    userId: string;
    text: string | null;
    createdAt: string;

    edited: string | null;
    isMine: boolean;
    isDeleted: boolean;

    reactionCounts: Record<string, number> | {};
    myReactions: Record<string, string> | {};
    replies: Comment[];
};

export type PostDto = {
    id: string;
    contentJson: string;
    createdAt: string;
    isPinned: boolean;
    reactionCounts: Record<string, number> | {};
    myReactions: Record<string, string> | {};
    comments: Comment[];
};

export type SectionType = "text" | "image";

export type PostSection = {
    type: SectionType;
    content: string;
    style?: Record<string, string>;
};

export type Post = {
    id: string;
    sections: PostSection[];
    createdAt: string;
    isPinned: boolean;
    reactionCounts: Record<string, number> | {};
    myReactions: Record<string, string> | {};
    comments: Comment[];
};

export type BoardDto = {
    posts: PostDto[];
    users: User[];
    totalPosts: number;
};

export type Board = {
    posts: Post[];
    users: User[];
    totalPosts: number;
};