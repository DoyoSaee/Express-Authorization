import {
  addComment,
  getCommentById,
  getComments,
  getCommentsByLikes,
  type CommentRecord,
} from "./comments.model";

type CommentByIdArgs = {
  id: string;
};

type CommentByPostIdArgs = {
  id: string;
};

type CommentByLikesArgs = {
  minLikes: number;
};

type AddCommentArgs = {
  comment: Partial<CommentRecord> & Pick<CommentRecord, "text">;
};

const commentResolvers = {
  Query: {
    comments: () => getComments(),
    commentById: (_parent: unknown, args: CommentByIdArgs) =>
      getCommentById(args.id),
    commentByPostId: (_parent: unknown, args: CommentByPostIdArgs) =>
      getCommentById(args.id),
    commentByLikes: (_parent: unknown, args: CommentByLikesArgs) =>
      getCommentsByLikes(args.minLikes),
  },
  Mutation: {
    addComment: (_parent: unknown, args: AddCommentArgs) =>
      addComment(args.comment),
  },
};

export default commentResolvers;

/*
module.exports = {
  Query: {
    comments: async (parent, args, context, info) => {
      // console.log("parent", parent);
      // console.log("args", args);
      // console.log("context", context);
      // console.log("info", info);
      const comment = await getComments();
      return comment;
    },
    commentById: async (parent, args, context, info) => {
      const comment = await getCommentById(args.id);
      return comment;
    },
    addComment: async (parent, args, context, info) => {
      const comment = await addComment(args.comment);
      return comment;
    },
  },
};
*/
