import { prisma } from "@/lib/db/prisma";
import { isMemoryMode, memoryReferenceLists } from "@/lib/demo-data/memory-store";
import { PrismaScreeningStatus, prismaScreeningStatuses } from "@/lib/domain/types";

export type BusinessCommentInput = {
  status: string;
  text: string;
};

function normalizeStatus(value: string): PrismaScreeningStatus {
  const normalized = value.trim().toUpperCase().replaceAll(" ", "_");
  if (!prismaScreeningStatuses.includes(normalized as PrismaScreeningStatus)) {
    throw new Error(`Unsupported comment status: ${value}`);
  }
  return normalized as PrismaScreeningStatus;
}

export async function updateBusinessComments(referenceListId: string, comments: BusinessCommentInput[]) {
  if (!referenceListId) throw new Error("Reference list is required.");
  if (!Array.isArray(comments) || comments.length === 0) throw new Error("At least one comment is required.");

  const normalizedComments = comments.map((comment) => ({
    status: normalizeStatus(comment.status),
    text: String(comment.text ?? "").trim()
  }));

  if (normalizedComments.some((comment) => !comment.text)) {
    throw new Error("Business comment text is required.");
  }

  if (isMemoryMode()) {
    const list = memoryReferenceLists.find((entry) => entry.id === referenceListId);
    if (!list) throw new Error("Reference list not found.");

    for (const comment of normalizedComments) {
      const existing = list.businessComments.find((entry) => entry.status === comment.status);
      if (existing) {
        existing.text = comment.text;
      } else {
        list.businessComments.push({
          id: `mem-comment-${Date.now()}-${comment.status}`,
          referenceListId,
          status: comment.status,
          text: comment.text
        });
      }
    }
    return list.businessComments;
  }

  const list = await prisma.referenceList.findUnique({ where: { id: referenceListId } });
  if (!list) throw new Error("Reference list not found.");

  await prisma.$transaction(async (tx) => {
    for (const comment of normalizedComments) {
      const existing = await tx.businessComment.findFirst({
        where: { referenceListId, status: comment.status }
      });
      if (existing) {
        await tx.businessComment.update({
          where: { id: existing.id },
          data: { text: comment.text }
        });
      } else {
        await tx.businessComment.create({
          data: {
            referenceListId,
            status: comment.status,
            text: comment.text
          }
        });
      }
    }
  });

  return prisma.businessComment.findMany({
    where: { referenceListId },
    orderBy: { status: "asc" }
  });
}
