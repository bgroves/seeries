import express from "express";
import Router from "express-promise-router";
import { fetchSeries } from "./handlers";
import { validationErrorHandler } from "./validators";
import { end } from "../../shared/src/db";
import { requireIntEnv, requireStrEnv } from "../../shared/src/config";
import cors from "cors";

const apiPort = requireIntEnv("API_PORT");
const corsOrigin = requireStrEnv("CORS_ORIGIN");

const router = Router();
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/series", fetchSeries);

const app = express();
app.use(
  cors({
    origin: corsOrigin == "*" ? "*" : `${corsOrigin}:${apiPort}`,
  })
);
app.use(router);
app.use(validationErrorHandler);

export const server = app.listen(apiPort, () => {
  console.log(`🐇[series]: Server is hopping at https://localhost:${apiPort}`);
});
server.addListener("close", end);
