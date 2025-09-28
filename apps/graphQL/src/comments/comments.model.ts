export interface CommentRecord {
  id: string;
  text: string;
  likes: number;
}

const comments: CommentRecord[] = [
  {
    id: "comment1",
    text: "Comment Text  1",
    likes: 10,
  },
  {
    id: "comment2",
    text: "Comment Text 2",
    likes: 2,
  },
];

export const getComments = () => comments;

export const getCommentById = (id: string) =>
  comments.find((comment) => comment.id === id) ?? null;

export const getCommentsByLikes = (minLikes: number) =>
  comments.filter((comment) => comment.likes >= minLikes);

export const addComment = (
  comment: Partial<CommentRecord> & Pick<CommentRecord, "text">
) => {
  const newComment: CommentRecord = {
    id: comment.id ?? `comment${comments.length + 1}`,
    likes: comment.likes ?? 0,
    text: comment.text,
  };

  comments.push(newComment);

  return newComment;
};

export default {
  getComments,
  getCommentById,
  addComment,
  getCommentsByLikes,
};

/*
module.exports = [
  {
    id: "comment1",
    text: "Comment Text  1",
    likes: 1,
  },
  {
    id: "comment2",
    text: "Comment Text 2",
    likes: 2,
  },
];
*/
