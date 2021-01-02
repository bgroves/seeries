import { suite as handlers } from "./test_handlers";
import { run } from "../../shared/src/caretest";

export const suites = [handlers];
if (require.main === module) {
  void (async () => {
    await run(handlers);
  })();
}
