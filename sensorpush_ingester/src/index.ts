import { ingest } from "./ingester";
import { rootLogger } from "./logger";
import { sensorpush } from "./config";

const logger = rootLogger.child({ module: "index" });
logger.info("Starting");
setImmediate(() => {
  void (async () => {
    for await (const sample of ingest(sensorpush.email, sensorpush.password)) {
      logger.info("Got %d samples for %d", sample.samples.length, sample.id);
    }
  })();
});
