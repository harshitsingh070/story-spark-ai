import { z } from "zod";

const createComment = z.object({
  body: z.object({
    postId: z.string({ required_error: "PostId is required!" }),
    comment: z
      .string({ required_error: "Comment is required!" })
      .min(10, "Comment must be at least 5 characters long"),
  }),
});

export const CommentValidator = {
  createComment,
};
