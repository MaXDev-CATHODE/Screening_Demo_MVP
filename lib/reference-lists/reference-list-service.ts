import { prisma } from "@/lib/db/prisma";
import { isMemoryMode, memoryReferenceLists } from "@/lib/demo-data/memory-store";

export type ReferenceListInput = {
  name: string;
  description?: string;
  active?: boolean;
  items: Array<{ name?: string; casNumber?: string | null; ecNumber?: string | null }>;
};

export async function listReferenceLists() {
  if (isMemoryMode()) {
    return memoryReferenceLists;
  }

  return prisma.referenceList.findMany({
    include: { items: true, rules: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function createReferenceList(input: ReferenceListInput) {
  if (!input.name.trim()) {
    throw new Error("Reference list name is required.");
  }

  if (isMemoryMode()) {
    const listId = `mem-list-${Date.now()}`;
    const referenceList = {
      id: listId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      active: input.active ?? true,
      createdAt: new Date(),
      items: input.items
        .filter((item) => item.name || item.casNumber || item.ecNumber)
        .map((item, index) => ({
          id: `mem-list-item-${Date.now()}-${index}`,
          referenceListId: listId,
          name: item.name?.trim() || null,
          casNumber: item.casNumber?.trim() || null,
          ecNumber: item.ecNumber?.trim() || null
        })),
      rules: [],
      businessComments: []
    };
    memoryReferenceLists.unshift(referenceList);
    return referenceList;
  }

  return prisma.referenceList.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      active: input.active ?? true,
      items: {
        create: input.items
          .filter((item) => item.name || item.casNumber || item.ecNumber)
          .map((item) => ({
            name: item.name?.trim() || null,
            casNumber: item.casNumber?.trim() || null,
            ecNumber: item.ecNumber?.trim() || null
          }))
      }
    },
    include: { items: true, rules: true }
  });
}
