import { Router } from "express";

import {
  getTodos,
  addTodos,
  updateTodos,
  removeTodos,
} from "../controllers/todos";

const router = Router();

router.get("/", getTodos);
router.post("/add", addTodos);
router.put("/update/:_id", updateTodos);
router.delete("/remove/:_id", removeTodos);

export default router;
