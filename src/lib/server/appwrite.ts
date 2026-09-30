import {
  Account,
  Client,
  TablesDB,
} from "node-appwrite";

function createBaseClient() {
  return new Client()
    .setEndpoint(
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
    )
    .setProject(
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
    );
}

export function createServerTablesDB() {
  const client = createBaseClient().setKey(
    process.env.APPWRITE_API_KEY!
  );

  return new TablesDB(client);
}

export function createJWTAccount(jwt: string) {
  const client = createBaseClient().setJWT(jwt);

  return new Account(client);
}