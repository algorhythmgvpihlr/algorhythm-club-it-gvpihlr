import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("No DATABASE_URL");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); // uses default db from URI
    const collection = db.collection('Certificate');
    const indexes = await collection.indexes();
    console.log("INDEXES:", JSON.stringify(indexes, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
main();
