import { PrismaScreeningStatus, toApiScreeningStatus } from "@/lib/domain/types";

type CommentLike = {
  status: PrismaScreeningStatus;
  text: string;
};

export function selectBusinessComment(comments: CommentLike[], status: PrismaScreeningStatus) {
  const comment = comments.find((entry) => entry.status === status);
  if (comment) return comment.text;

  return `Demo: wynik ${toApiScreeningStatus(status)} wymaga interpretacji przez osobę odpowiedzialną.`;
}
