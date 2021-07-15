import dotenv from "dotenv";
import helmet from "helmet";
import express from "express";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import compression from "compression";
import dotenvExpand from "dotenv-expand";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvExpand(dotenv.config({ path: join(__dirname, "../.env") }));

const app = express();
const port = process.env.APP_PORT;

import resHandler from "./response-handler.js";

app.use(helmet());
app.use(compression());

app.get("/", resHandler);

app.listen(port, () => {
  console.log(`Server running at: ${process.env.APP_BASE_URL}`);
  console.log("Hit CTRL-C to stop the server");
});
