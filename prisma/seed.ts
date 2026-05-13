import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://demo:demo@localhost:5432/screening_demo"
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.screeningResult.deleteMany();
  await prisma.substance.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.businessComment.deleteMany();
  await prisma.screeningRule.deleteMany();
  await prisma.referenceListItem.deleteMany();
  await prisma.referenceList.deleteMany();
  await prisma.company.deleteMany();

  const acme = await prisma.company.create({
    data: { name: "Acme Chemicals", slug: "acme-chem" }
  });

  const baltic = await prisma.company.create({
    data: { name: "Baltic Manufacturing", slug: "baltic-manufacturing" }
  });

  await prisma.user.create({
    data: {
      displayName: "Marta Nowak",
      email: "superadmin@demo.local",
      role: "SUPER_ADMIN"
    }
  });

  await prisma.user.create({
    data: {
      displayName: "Jan Kowalski",
      email: "admin@acme.demo.local",
      role: "COMPANY_ADMIN",
      companyId: acme.id
    }
  });

  await prisma.user.create({
    data: {
      displayName: "Anna Zielińska",
      email: "user@acme.demo.local",
      role: "STANDARD_USER",
      companyId: acme.id
    }
  });

  await prisma.user.create({
    data: {
      displayName: "Piotr Wiśniewski",
      email: "admin@baltic.demo.local",
      role: "COMPANY_ADMIN",
      companyId: baltic.id
    }
  });

  const svhc = await prisma.referenceList.create({
    data: {
      id: "demo-svhc-list",
      name: "SVHC demo list",
      description: "Syntetyczna lista pokazująca screening CAS/EC/nazwy i progu stężenia.",
      active: true,
      items: {
        create: [
          { name: "Bisphenol A", casNumber: "80-05-7", ecNumber: "201-245-8" },
          { name: "Formaldehyde", casNumber: "50-00-0", ecNumber: "200-001-8" }
        ]
      },
      rules: {
        create: {
          name: "Mieszanina powyżej 0,1%",
          active: true,
          conditions: { productTypeEquals: "MIXTURE", concentrationGreaterThan: 0.1 },
          outcomeStatus: "VERIFICATION_REQUIRED"
        }
      },
      businessComments: {
        create: [
          {
            status: "MATCH",
            text: "Demo: składnik został znaleziony na liście referencyjnej. Wynik wymaga potwierdzenia przez osobę odpowiedzialną."
          },
          {
            status: "NO_MATCH",
            text: "Demo: nie znaleziono zgodności z wybraną listą referencyjną dla przykładowych danych."
          },
          {
            status: "VERIFICATION_REQUIRED",
            text: "Demo: składnik spełnia warunek reguły i powinien zostać przekazany do weryfikacji merytorycznej."
          }
        ]
      }
    }
  });

  await prisma.referenceList.create({
    data: {
      id: "demo-internal-watch-list",
      name: "Internal watch list",
      description: "Druga lista pokazująca, że różne listy mogą mieć różne warunki.",
      active: true,
      items: {
        create: [{ name: "Toluene", casNumber: "108-88-3", ecNumber: "203-625-9" }]
      },
      businessComments: {
        create: [
          {
            status: "MATCH",
            text: "Demo: znaleziono wpis na wewnętrznej liście obserwacyjnej."
          },
          {
            status: "NO_MATCH",
            text: "Demo: brak trafień na wewnętrznej liście obserwacyjnej."
          }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      companyId: acme.id,
      name: "Epoxy Blend A",
      productType: "MIXTURE",
      dataQualityStatus: "READY",
      substances: {
        create: [{ name: "Bisphenol A", casNumber: "80-05-7", ecNumber: "201-245-8", concentrationPercent: 0.2 }]
      }
    }
  });

  await prisma.product.create({
    data: {
      companyId: acme.id,
      name: "Label Resin Sample",
      productType: "ARTICLE",
      dataQualityStatus: "READY",
      substances: {
        create: [{ name: "Formaldehyde", casNumber: "50-00-0", ecNumber: "200-001-8", concentrationPercent: 0.05 }]
      }
    }
  });

  await prisma.product.create({
    data: {
      companyId: acme.id,
      name: "Clean Article 12",
      productType: "ARTICLE",
      dataQualityStatus: "READY",
      substances: {
        create: [{ name: "Water", casNumber: "7732-18-5", ecNumber: "231-791-2", concentrationPercent: 4.5 }]
      }
    }
  });

  await prisma.product.create({
    data: {
      companyId: baltic.id,
      name: "Baltic Private Sample",
      productType: "MIXTURE",
      dataQualityStatus: "LIMITED",
      substances: {
        create: [{ name: "Bisfenol A", concentrationPercent: 0.08 }]
      }
    }
  });

  console.log(`Seed complete: ${acme.name}, ${baltic.name}, ${svhc.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
