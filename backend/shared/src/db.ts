import pg from "pg";
import { requireStrEnv } from "./config";

const user = requireStrEnv("POSTGRES_USER");
const password = requireStrEnv("POSTGRES_PASSWORD");
const host = requireStrEnv("POSTGRES_HOST");

export const pool = new pg.Pool({ user, host, password });
