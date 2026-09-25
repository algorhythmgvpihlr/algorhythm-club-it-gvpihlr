import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.$runCommandRaw({
      dropIndexes: "Certificate",
      index: "Certificate_eventId_rollNumber_key"
    });
    console.log("DROP INDEX RESULT:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main().finally(() => prisma.$disconnect());
