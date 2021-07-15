import { Request, Response, NextFunction } from "express";

import { Todo } from "../interfaces/models";

let todos: Todo[] = [];
type TodoParam = {
  _id: string;
};
type TodoBody = {
  text: string;
};

export const getTodos = (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({ todos });
};

export const addTodos = (req: Request<TodoParam, any, TodoBody, any>, res: Response, next: NextFunction) => {
  const newTodo: Todo = {
    _id: Date.now().toString(),
    text: req.body.text,
  };

  todos.push(newTodo);

  return res.status(201).json({ todos });
};

export const updateTodos = (req: Request<TodoParam, any, TodoBody, any>, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  const { text } = req.body;
  const todoIndex = todos.findIndex((todoItem) => todoItem._id === _id);

  if (todoIndex >= 0) {
    todos[todoIndex] = { _id: todos[todoIndex]._id, text };

    return res.status(201).json(todos[todoIndex]);
  } else {
    return res.status(404).json({ message: `Todo #${_id} does not exist!` });
  }
};

export const removeTodos = (req: Request<TodoParam, any, TodoBody, any>, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  todos = todos.filter((todoItem) => todoItem._id !== _id);

  return res.status(200).json({ todos });
};
