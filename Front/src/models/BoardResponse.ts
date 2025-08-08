export type Reaction = {
    id: string;
    type: string;
    userId: string;
};

export type User = {
    id: string;
    userName: string;
    avatarBase64: string;
};

export type Comment = {
    id: string;
    text: string | null;
    createdAt: string;
    edited: string | null;
    user: User;
    reactions: Reaction[];
};

export type Post = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    reactions: Reaction[];
    comments: Comment[];
};

export type BoardResponse = {
    posts: Post[];
};
