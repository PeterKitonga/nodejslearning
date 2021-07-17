import { RouterContext } from "https://deno.land/x/oak@v7.7.0/mod.ts";
import { Todo } from "../interfaces/models.ts";

let todos: Todo[] = [];

export const getTodos = (ctx: RouterContext) => {
  return (ctx.response.body = { todos });
};

export const addTodos = async (ctx: RouterContext) => {
  const body = ctx.request.body();
  const data = await body.value;

  const newTodo: Todo = {
    _id: Date.now().toString(),
    text: data.text,
  };

  todos.push(newTodo);

  return (ctx.response.body = { todos });
};

export const updateTodos = async (ctx: RouterContext) => {
  const { _id } = ctx.params;

  const body = ctx.request.body();
  const data = await body.value;

  const todoIndex = todos.findIndex((todoItem) => todoItem._id === _id);

  if (todoIndex >= 0) {
    todos[todoIndex] = { _id: todos[todoIndex]._id, text: data.text };

    return (ctx.response.body = todos[todoIndex]);
  } else {
    return (ctx.response.body = { message: `Todo #${_id} does not exist!` });
  }
};

export const removeTodos = (ctx: RouterContext) => {
  const { _id } = ctx.params;
  todos = todos.filter((todoItem) => todoItem._id !== _id);

  return (ctx.response.body = { todos });
};
