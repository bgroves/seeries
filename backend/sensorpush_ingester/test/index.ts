import db from "./test_db";
import ingester from "./test_ingester";
import { run } from "../../shared/src/caretest";
import { end } from "../../shared/src/db";

export const suites = [db, ingester];
if (require.main === module) {
  void (async () => {
    await run(db, ingester);
    end();
  })();
}
