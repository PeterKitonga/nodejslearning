import { MongoClient } from "https://deno.land/x/mongo@v0.23.1/mod.ts";
import { Database } from "https://deno.land/x/mongo@v0.23.1/src/database.ts";

const client = new MongoClient();
const databaseName = Deno.env.get("MONGO_DATABASE") ?? "deno_learning_api";

export const connectDatabase = async (): Promise<Database> => {
  try {
    let connection: Database;
    const databaseHost = Deno.env.get("MONGO_HOST");
    const databasePort = Number(Deno.env.get("MONGO_PORT")) ?? 27017;
    const databaseProvider = Deno.env.get("MONGO_PROVIDER");
    const databaseUsername = Deno.env.get("MONGO_USERNAME");
    const databasePassword = Deno.env.get("MONGO_PASSWORD");

    if (databaseProvider === "atlas") {
      /**
       * Connecting to a Mongo Atlas Database
       * 
       * Note: will only work with tiers that support cursors
      */
      connection = await client.connect(
        `mongodb+srv://${databaseUsername}:${databasePassword}@${databaseHost}/${databaseName}?authMechanism=SCRAM-SHA-1&retryWrites=true&w=majority`
      );
    } else {
      // Connecting to a Local Database
      connection = await client.connect(
        `mongodb://${databaseUsername}:${databasePassword}@${databaseHost}:${databasePort}/?authSource=admin`
      );
    }

    return connection;
  } catch (err) {
    throw err;
  }
};

export const getDatabase = (): Database => {
  try {
    const db = client.database(databaseName);

    return db;
  } catch (err) {
    throw err;
  }
};
