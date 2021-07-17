import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import express from "express";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import dotenvExpand from "dotenv-expand";

import todoRoutes from "./routes/todos.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvExpand(dotenv.config({ path: join(__dirname, "../.env") }));

const app = express();
const port = process.env.APP_PORT;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/", (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the node.js alternative of deno",
  });
});

app.use("/todos", todoRoutes);

app.listen(port, () => {
  console.log(`Server running at: ${process.env.APP_BASE_URL}`);
  console.log("Hit CTRL-C to stop the server");
});
