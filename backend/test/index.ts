import { suites as api } from "../api/test";
import { suites as sensorpush_ingester } from "../sensorpush_ingester/test";

import { run } from "../shared/src/caretest";

void (async () => {
  await run(...sensorpush_ingester.concat(api));
})();
