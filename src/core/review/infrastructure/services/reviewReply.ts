export interface ReviewReplyProps {
  id?: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export class ReviewReply {
  constructor(public readonly props: ReviewReplyProps) {
    if (!props.content.trim()) throw new Error("Reply content cannot be empty");
  }
}