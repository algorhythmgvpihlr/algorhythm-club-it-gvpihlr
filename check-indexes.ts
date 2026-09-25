import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const indexes = await prisma.$runCommandRaw({
      listIndexes: "Certificate"
    });
    console.log("INDEXES:", JSON.stringify(indexes, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main().finally(() => prisma.$disconnect());
