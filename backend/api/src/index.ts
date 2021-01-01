import express from "express";
import Router from "express-promise-router";
import { fetchSeries } from "./handlers";
import { validationErrorHandler } from "./validators";
import { end } from "../../shared/src/db";

const router = Router();
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/series", fetchSeries);

const app = express();
app.use(router);
app.use(validationErrorHandler);
const PORT = 8000;
export const server = app.listen(PORT, () => {
  console.log(`🐇[series]: Server is hopping at https://localhost:${PORT}`);
});
server.addListener("close", end);
