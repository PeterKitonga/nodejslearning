import { Router } from "https://deno.land/x/oak@v7.7.0/mod.ts";

import {
  getTodos,
  addTodos,
  updateTodos,
  removeTodos,
} from "../controllers/todos.ts";

const router = new Router();

router.get("/todos", getTodos);
router.post("/todos/add", addTodos);
router.put("/todos/update/:_id", updateTodos);
router.delete("/todos/remove/:_id", removeTodos);

export default router;
