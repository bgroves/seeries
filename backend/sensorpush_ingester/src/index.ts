import { ingest } from "./ingester";
import { rootLogger } from "./logger";
import { requireStrEnv } from "../../shared/src/config";

const email = requireStrEnv("SENSORPUSH_EMAIL");
const password = requireStrEnv("SENSORPUSH_PASSWORD");

const logger = rootLogger.child({ module: "index" });
logger.info("Starting");
setImmediate(() => {
  void (async () => {
    for await (const sample of ingest(email, password)) {
      logger.info("Got %d samples for %d", sample.samples.length, sample.id);
    }
  })();
});
