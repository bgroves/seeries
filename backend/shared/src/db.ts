import pg from "pg";
import { requireStrEnv } from "./config";
import { AsyncLocalStorage } from "async_hooks";

const user = requireStrEnv("POSTGRES_USER");
const password = requireStrEnv("POSTGRES_PASSWORD");
const host = requireStrEnv("POSTGRES_HOST");

const underlyingPool = new pg.Pool({ user, host, password });

const clientStorage = new AsyncLocalStorage<pg.PoolClient>();

export function pool(): pg.Pool | pg.PoolClient {
  const client = clientStorage.getStore();
  return client !== undefined ? client : underlyingPool;
}

export function end(): void {
  void underlyingPool.end();
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