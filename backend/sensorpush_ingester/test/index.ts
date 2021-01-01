import db from "./test_db";
import ingester from "./test_ingester";
import { run } from "../../shared/src/caretest";
import { end } from "../../shared/src/db";

void (async () => {
  await run(db, ingester);
  end();
})();
