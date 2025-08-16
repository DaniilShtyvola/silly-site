import { CommentDto, PostWithCommentsDto } from "../models/BoardResponse";

type ParentType = "post" | "comment";

export function updateReactionsInBoard(
    posts: PostWithCommentsDto[],
    parentId: string,
    type: string,
    reactionId: string | null,
    parentType: ParentType
): PostWithCommentsDto[] {
    return posts.map(post => {
        if (parentType === "post" && post.id === parentId) {
            const newReactionCounts = { ...post.reactionCounts };
            const newMyReactions = { ...(post.myReactions as Record<string, string>) };

            if (reactionId) {
                newReactionCounts[type] = (newReactionCounts[type] || 0) + 1;
                newMyReactions[type] = reactionId;
            } else {
                if (newReactionCounts[type] && newReactionCounts[type] > 0) {
                    newReactionCounts[type] -= 1;
                    if (newReactionCounts[type] === 0) delete newReactionCounts[type];
                }
                delete newMyReactions[type];
            }

            return { ...post, reactionCounts: newReactionCounts, myReactions: newMyReactions };
        }

        const updatedComments = updateCommentReactions(post.comments, parentId, type, reactionId);
        return { ...post, comments: updatedComments };
    });
}

function updateCommentReactions(
    comments: CommentDto[],
    commentId: string,
    type: string,
    reactionId: string | null
): CommentDto[] {
    return comments.map(c => {
        if (c.id === commentId) {
            const newReactionCounts = { ...c.reactionCounts };
            const newMyReactions = { ...(c.myReactions as Record<string, string>) };

            if (reactionId) {
                newReactionCounts[type] = (newReactionCounts[type] || 0) + 1;
                newMyReactions[type] = reactionId;
            } else {
                if (newReactionCounts[type] && newReactionCounts[type] > 0) {
                    newReactionCounts[type] -= 1;
                    if (newReactionCounts[type] === 0) delete newReactionCounts[type];
                }
                delete newMyReactions[type];
            }

            return { ...c, reactionCounts: newReactionCounts, myReactions: newMyReactions };
        } else if (c.replies.length > 0) {
            return { ...c, replies: updateCommentReactions(c.replies, commentId, type, reactionId) };
        } else {
            return c;
        }
    });
}
