import pg from "pg";
import { requireStrEnv } from "./config";
import { AsyncLocalStorage } from "async_hooks";

const user = requireStrEnv("POSTGRES_USER");
const password = requireStrEnv("POSTGRES_PASSWORD");
const host = requireStrEnv("POSTGRES_HOST");

const underlyingPool = new pg.Pool({ user, host, password });

export function end(): void {
  void underlyingPool.end();
}


// This is inspired by Django's [transaction management(https://docs.djangoproject.com/en/3.1/topics/db/transactions/).
// You can grab a client in AsyncLocalStorage and then every call to pool will use that client. That means you can 
// put a bunch of calls that use the db into a shared transaction without having to explicitly pass a client into them.
//
// It'll likely be necessary to add an "atomic" function like Django's that allows nesting of atomic database behavior.
// It starts a transaction on the outermost atomic call and uses savepoints inside of that. I only need the ephemeral
// testing behavior for now, so only adding that.
const clientStorage = new AsyncLocalStorage<pg.PoolClient>();

export function pool(): pg.Pool | pg.PoolClient {
  const client = clientStorage.getStore();
  return client !== undefined ? client : underlyingPool;
}

export async function withClient<T>(op: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const existingClient = clientStorage.getStore();
  if (existingClient !== undefined) {
    return await op(existingClient);
  }
  const newClient = await underlyingPool.connect();
  try {
    return await clientStorage.run(newClient, () => {
      return op(newClient);
    });
  } finally {
    newClient.release();
  }
}

export async function ephemerally<T>(op: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  return await withClient(async (client) => {
    await client.query("BEGIN");
    // We don't try/catch this as an exception being thrown releases this client without
    // committing the transaction. That's effectively a rollback.
    const t = await op(client);
    await client.query("ROLLBACK");
    return t;
  });
}