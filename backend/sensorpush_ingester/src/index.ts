import { createAuthorizer, fetchLatest } from "./ingester";
import { rootLogger } from "./logger";
import { requireStrEnv } from "../../shared/src/config";
import { insert } from "./db";

const email = requireStrEnv("SENSORPUSH_EMAIL");
const password = requireStrEnv("SENSORPUSH_PASSWORD");

const logger = rootLogger.child({ module: "index" });
logger.info("Starting");
const authorizer = createAuthorizer(email, password);
async function insertLatest() {
  const lastStart = new Date().getTime();
  for await (const sample of fetchLatest(authorizer)) {
    await insert(sample);
    logger.info("Got %d samples for %d", sample.samples.length, sample.id);
  }
  const nextStart = lastStart + 60_000;
  const now = new Date().getTime();
  const delay = nextStart < now ? 0 : nextStart - now;
  if (delay > 0) {
    logger.info(
      `Took ${(now - lastStart) / 1_000} seconds. Running next in ${delay / 1_000} seconds.`
    );
  } else {
    logger.warn(
      `Took ${(now - lastStart) / 1_000} seconds, over a minute! Running again immediately.`
    );
  }
  setTimeout(() => {
    void insertLatest();
  }, delay);
}

void insertLatest();
