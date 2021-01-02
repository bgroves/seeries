import { suite } from "./test_handlers";
import { run } from "../../shared/src/caretest";
import { server } from "../src/index";

void (async () => {
  await run(suite);
  server.close();
})();
