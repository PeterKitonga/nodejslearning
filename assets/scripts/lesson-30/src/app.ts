import path from "path";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import express, { Request, Response, NextFunction } from "express";

dotenvExpand(dotenv.config({ path: path.join(__dirname, "../.env") }));

import todoRoutes from "./routes/todos";

const app = express();
const port = process.env.APP_PORT;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ message: `Hello There! Running at: ${process.env.APP_BASE_URL}` });
});

app.use("/todos", todoRoutes);

app.listen(port, () => {
  console.log(`Server running at: ${process.env.APP_BASE_URL}`);
  console.log("Hit CTRL-C to stop the server");
});