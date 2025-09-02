import { UserStyleDto } from "./UserStyle";

export type ParentType = "post" | "comment";

export type User = {
    id: string;
    userName: string;
    style: UserStyleDto;
};

export type Reaction = {
    type: string;
    count: number;
    isMine: boolean;
};

export type Comment = {
    id: string;
    userId: string | null;
    text: string | null;
    createdAt: string;

    isEdited: boolean;
    isDeleted: boolean;
    isMine: boolean;

    reactions: Reaction[];
    replies: Comment[];
};

export type PostDto = {
    id: string;
    contentJson: string;
    category: string;
    createdAt: string;
    isPinned: boolean;
    reactions: Reaction[];
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
    category: string;
    createdAt: string;
    isPinned: boolean;
    reactions: Reaction[];
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
