import { PostDto, Post, PostSection } from "../models/BoardResponse";

export const parsePosts = (postsDto: PostDto[]): Post[] => {
    return postsDto.map(post => {
        let sections: PostSection[] = [];

        sections = JSON.parse(post.contentJson || "[]") as PostSection[];

        return {
            id: post.id,
            sections,
            createdAt: post.createdAt,
            isPinned: post.isPinned,
            reactionCounts: post.reactionCounts,
            myReactions: post.myReactions,
            comments: post.comments,
        };
    });
};