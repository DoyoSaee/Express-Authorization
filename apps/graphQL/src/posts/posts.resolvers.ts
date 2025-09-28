import { addPost, getPostById, getPosts, type PostRecord } from "./posts.model";

type PostArgs = {
  id: string;
};

type AddPostArgs = {
  post: Partial<PostRecord> & Pick<PostRecord, "title" | "description">;
};

const postResolvers = {
  Query: {
    posts: () => getPosts(),
    postById: (_parent: unknown, args: PostArgs) => getPostById(args.id),
  },
  Mutation: {
    addPost: (_parent: unknown, args: AddPostArgs) => addPost(args.post),
  },
};

export default postResolvers;

/*
const { getPosts, getPostById, addPost } = require("./posts.model");

module.exports = {
  Query: {
    posts: async (parent, args, context, info) => {
      // console.log("parent", parent);
      // console.log("args", args);
      // console.log("context", context);
      // console.log("info", info);
      const product = await parent.posts;
      return product;
    },
    postById: async (parent, args, context, info) => {
      const post = await getPostById(args.id);
      return post;
    },
    addPost: async (parent, args, context, info) => {
      const post = await addPost(args.post);
      return post;
    },
  },
};
*/
