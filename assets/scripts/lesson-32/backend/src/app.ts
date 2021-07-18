import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { Application, Context } from "https://deno.land/x/oak@v7.7.0/mod.ts";

import todoRoutes from "./routes/todos.ts";
import { connectDatabase } from "./loaders/database.ts";

config({ export: true, safe: true });

const app = new Application();
const port = Number(Deno.env.get("APP_PORT"));

await connectDatabase();

app.use(async (ctx: Context, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  await next();
});

app.use(todoRoutes.routes());
app.use(todoRoutes.allowedMethods());

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? "https://" : "http://"}${
      hostname ?? "127.0.0.1"
    }:${port}`
  );
  console.log("Hit CTRL-C to stop the server");
});

await app.listen({ port });
