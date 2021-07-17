import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { Application } from "https://deno.land/x/oak@v7.7.0/mod.ts";

import todoRoutes from "./routes/todos.ts";

config({ export: true, safe: true });

const app = new Application();
const port = Number(Deno.env.get("APP_PORT"));

app.use(async (ctx, next) => {
  ctx.response.body = { message: "Hello World!" };
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
