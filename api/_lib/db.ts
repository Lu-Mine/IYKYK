import { MongoClient, Db } from 'mongodb';

let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI || 
              process.env.MONGO_URI || 
              process.env.MONGODB_URL || 
              process.env.MONGO_URL;

  if (!uri) {
    throw new Error(
      'MongoDB connection error: Please set the "MONGODB_URI" environment variable in your AI Studio settings / secrets. (Checked MONGODB_URI, MONGO_URI, MONGODB_URL, MONGO_URL)'
    );
  }

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }

  const connection = await globalWithMongo._mongoClientPromise;
  return connection.db();
}
