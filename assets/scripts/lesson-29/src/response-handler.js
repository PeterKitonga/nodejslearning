import fs from "fs/promises";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, "../html");

const resHandler = async (req, res, next) => {
  try {
    const data = await fs.readFile(`${htmlPath}/home.html`, "utf8");
    res.send(data);
  } catch (err) {
    console.log(err);
  }
};

export default resHandler;
