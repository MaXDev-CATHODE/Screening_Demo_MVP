import { ProductInput, RuleConditions, UserRole } from "@/lib/domain/types";
import { normalizeSubstanceInput, validateProductInput } from "@/lib/validation/product";

export function isMemoryMode() {
  return process.env.DEMO_DATA_MODE === "memory";
}

export type MemoryUser = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  companyName?: string | null;
};

export type MemorySubstance = {
  id: string;
  productId: string;
  name: string;
  casNumber: string | null;
  ecNumber: string | null;
  concentrationPercent: number;
};

export type MemoryProduct = {
  id: string;
  companyId: string;
  name: string;
  productType: "SUBSTANCE" | "MIXTURE" | "ARTICLE";
  dataQualityStatus: "READY" | "LIMITED" | "INVALID";
  createdAt: Date;
  substances: MemorySubstance[];
};

export type MemoryReferenceList = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: Date;
  items: Array<{ id: string; referenceListId: string; name: string | null; casNumber: string | null; ecNumber: string | null }>;
  rules: MemoryRule[];
  businessComments: Array<{ id: string; referenceListId: string; status: "MATCH" | "NO_MATCH" | "VERIFICATION_REQUIRED"; text: string }>;
};

export type MemoryRule = {
  id: string;
  referenceListId: string;
  name: string;
  active: boolean;
  conditions: RuleConditions;
  outcomeStatus: "MATCH" | "NO_MATCH" | "VERIFICATION_REQUIRED";
};

export type MemoryScreeningResult = {
  id: string;
  productId: string;
  referenceListId: string;
  status: "MATCH" | "NO_MATCH" | "VERIFICATION_REQUIRED";
  matchedField: "CAS" | "EC" | "NAME" | "RULE" | "NONE";
  reason: string;
  comment: string;
  createdAt: Date;
};

let sequence = 100;
const id = (prefix: string) => `${prefix}-${sequence++}`;

export const memoryUsers: MemoryUser[] = [
  {
    id: "mem-super",
    displayName: "Marta Nowak",
    email: "superadmin@demo.local",
    role: "SUPER_ADMIN",
    companyId: null,
    companyName: "Global workspace"
  },
  {
    id: "mem-admin",
    displayName: "Jan Kowalski",
    email: "admin@acme.demo.local",
    role: "COMPANY_ADMIN",
    companyId: "mem-acme",
    companyName: "Acme Chemicals"
  },
  {
    id: "mem-user",
    displayName: "Anna Zielińska",
    email: "user@acme.demo.local",
    role: "STANDARD_USER",
    companyId: "mem-acme",
    companyName: "Acme Chemicals"
  }
];

export const memoryProducts: MemoryProduct[] = [
  {
    id: "mem-product-verification",
    companyId: "mem-acme",
    name: "Epoxy Blend A",
    productType: "MIXTURE",
    dataQualityStatus: "READY",
    createdAt: new Date("2026-05-13T00:00:00.000Z"),
    substances: [
      {
        id: "mem-sub-bpa",
        productId: "mem-product-verification",
        name: "Bisphenol A",
        casNumber: "80-05-7",
        ecNumber: "201-245-8",
        concentrationPercent: 0.2
      }
    ]
  },
  {
    id: "mem-product-match",
    companyId: "mem-acme",
    name: "Label Resin Sample",
    productType: "ARTICLE",
    dataQualityStatus: "READY",
    createdAt: new Date("2026-05-13T00:00:00.000Z"),
    substances: [
      {
        id: "mem-sub-formaldehyde",
        productId: "mem-product-match",
        name: "Formaldehyde",
        casNumber: "50-00-0",
        ecNumber: "200-001-8",
        concentrationPercent: 0.05
      }
    ]
  },
  {
    id: "mem-product-no-match",
    companyId: "mem-acme",
    name: "Clean Article 12",
    productType: "ARTICLE",
    dataQualityStatus: "READY",
    createdAt: new Date("2026-05-13T00:00:00.000Z"),
    substances: [
      {
        id: "mem-sub-water",
        productId: "mem-product-no-match",
        name: "Water",
        casNumber: "7732-18-5",
        ecNumber: "231-791-2",
        concentrationPercent: 4.5
      }
    ]
  }
];

export const memoryReferenceLists: MemoryReferenceList[] = [
  {
    id: "mem-svhc",
    name: "SVHC demo list",
    description: "Syntetyczna lista pokazująca screening CAS/EC/nazwy i progu stężenia.",
    active: true,
    createdAt: new Date("2026-05-13T00:00:00.000Z"),
    items: [
      { id: "mem-item-bpa", referenceListId: "mem-svhc", name: "Bisphenol A", casNumber: "80-05-7", ecNumber: "201-245-8" },
      { id: "mem-item-formaldehyde", referenceListId: "mem-svhc", name: "Formaldehyde", casNumber: "50-00-0", ecNumber: "200-001-8" }
    ],
    rules: [
      {
        id: "mem-rule-threshold",
        referenceListId: "mem-svhc",
        name: "Mieszanina powyżej 0,1%",
        active: true,
        conditions: { productTypeEquals: "MIXTURE", concentrationGreaterThan: 0.1 },
        outcomeStatus: "VERIFICATION_REQUIRED"
      }
    ],
    businessComments: [
      { id: "mem-comment-match", referenceListId: "mem-svhc", status: "MATCH", text: "Demo: składnik został znaleziony na liście referencyjnej." },
      { id: "mem-comment-none", referenceListId: "mem-svhc", status: "NO_MATCH", text: "Demo: brak zgodności z wybraną listą referencyjną." },
      { id: "mem-comment-review", referenceListId: "mem-svhc", status: "VERIFICATION_REQUIRED", text: "Demo: warunek reguły został spełniony i wymaga weryfikacji." }
    ]
  }
];

export const memoryResults: MemoryScreeningResult[] = [];

export function findMemoryUser(idOrRole: string) {
  return memoryUsers.find((user) => user.id === idOrRole || user.role === idOrRole);
}

export function createMemoryProduct(companyId: string, input: ProductInput) {
  const validation = validateProductInput(input);
  if (!validation.ok) throw new Error(validation.errors.join(" "));
  const productId = id("mem-product");
  const product: MemoryProduct = {
    id: productId,
    companyId,
    name: input.name.trim(),
    productType: input.productType,
    dataQualityStatus: validation.status,
    createdAt: new Date(),
    substances: input.substances.map((substance) => {
      const normalized = normalizeSubstanceInput(substance);
      return {
        id: id("mem-substance"),
        productId,
        name: normalized.name,
        casNumber: normalized.casNumber,
        ecNumber: normalized.ecNumber,
        concentrationPercent: normalized.concentrationPercent ?? 0
      };
    })
  };
  memoryProducts.unshift(product);
  return product;
}
