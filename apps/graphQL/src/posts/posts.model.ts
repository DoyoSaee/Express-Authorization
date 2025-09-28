import type { CommentRecord } from "../comments/comments.model";

export interface PostRecord {
  id: string;
  title: string;
  description: string;
  comments: CommentRecord[];
}

const posts: PostRecord[] = [
  {
    id: "1",
    title: "Post 1",
    description: "Description 1",
    comments: [
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
    ],
  },
  {
    id: "2",
    title: "Post 2",
    description: "Description 2",
    comments: [],
  },
];

export const getPosts = () => posts;

export const getPostById = (id: string) =>
  posts.find((post) => post.id === id) ?? null;

export const addPost = (
  post: Partial<PostRecord> & Pick<PostRecord, "title" | "description">
) => {
  const newPost: PostRecord = {
    id: post.id ?? `${posts.length + 1}`,
    title: post.title,
    description: post.description,
    comments: post.comments ?? [],
  };

  posts.push(newPost);

  return newPost;
};

export default {
  getPosts,
  getPostById,
  addPost,
};

/*
module.exports = [
  {
    id: "1",
    title: "Post 1",
    description: "Description 1",
    comments: [
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
    ],
  },
  {
    id: "2",
    title: "Post 2",
    description: "Description 2",
    comments: [],
  },
];
*/

// mutation {
//   addPost(
//     post: {
//       title: "제목 입력"
//       description: "내용 입력"
//     }
//   ) {
//     id
//     title
//     description
//   }
// }
