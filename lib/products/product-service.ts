import { prisma } from "@/lib/db/prisma";
import { DemoUser, ProductInput } from "@/lib/domain/types";
import { productCompanyFilter } from "@/lib/auth/company-scope";
import { normalizeSubstanceInput, validateProductInput } from "@/lib/validation/product";
import { createMemoryProduct, isMemoryMode, memoryProducts } from "@/lib/demo-data/memory-store";

export async function listProducts(user: DemoUser) {
  if (isMemoryMode()) {
    return memoryProducts.filter((product) => user.role === "SUPER_ADMIN" || product.companyId === user.companyId);
  }

  return prisma.product.findMany({
    where: productCompanyFilter(user),
    include: { substances: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function createProduct(user: DemoUser, input: ProductInput) {
  if (!user.companyId || user.role !== "COMPANY_ADMIN") {
    throw new Error("FORBIDDEN");
  }

  if (isMemoryMode()) {
    return createMemoryProduct(user.companyId, input);
  }

  const validation = validateProductInput(input);
  if (!validation.ok) {
    throw new Error(validation.errors.join(" "));
  }

  return prisma.product.create({
    data: {
      companyId: user.companyId,
      name: input.name.trim(),
      productType: input.productType,
      dataQualityStatus: validation.status,
      substances: {
        create: input.substances.map((substance) => {
          const normalized = normalizeSubstanceInput(substance);
          return {
            name: normalized.name,
            casNumber: normalized.casNumber,
            ecNumber: normalized.ecNumber,
            concentrationPercent: normalized.concentrationPercent ?? 0
          };
        })
      }
    },
    include: { substances: true }
  });
}

export async function importProducts(user: DemoUser, inputs: ProductInput[]) {
  let created = 0;
  let limited = 0;
  let invalid = 0;

  for (const input of inputs) {
    const validation = validateProductInput(input);
    if (!validation.ok) {
      invalid += 1;
      continue;
    }
    const product = await createProduct(user, input);
    created += 1;
    if (product.dataQualityStatus === "LIMITED") limited += 1;
  }

  return { created, limited, invalid };
}
