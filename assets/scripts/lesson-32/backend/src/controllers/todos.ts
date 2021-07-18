import { Bson } from "https://deno.land/x/mongo@v0.23.1/mod.ts";
import { RouterContext } from "https://deno.land/x/oak@v7.7.0/mod.ts";

import { TodoSchema } from "../models/todo.ts";
import { getDatabase } from "../loaders/database.ts";

export const getTodos = async (ctx: RouterContext) => {
  try {
    const allTodos = await getDatabase()
      .collection<TodoSchema>("todos")
      .find()
      .toArray();
    const result = allTodos.map((todoItem) => {
      return { id: todoItem._id, text: todoItem.text };
    });

    return (ctx.response.body = { todos: result });
  } catch (err) {
    console.log(err);
  }
};

export const addTodos = async (ctx: RouterContext) => {
  try {
    const body = ctx.request.body();
    const data = await body.value;

    const newTodo: { id?: string; text: string } = {
      text: data.text,
    };

    const savedTodo = await getDatabase()
      .collection<TodoSchema>("todos")
      .insertOne(newTodo);
    newTodo.id = savedTodo._id;

    return (ctx.response.body = { todo: newTodo });
  } catch (err) {
    console.log(err);
  }
};

export const updateTodos = async (ctx: RouterContext) => {
  try {
    const { _id } = ctx.params;

    const body = ctx.request.body();
    const data = await body.value;

    const updatedTodo = await getDatabase()
      .collection<TodoSchema>("todos")
      .updateOne(
        { _id: new Bson.ObjectId(_id) },
        { $set: { text: data.text } }
      );

    return (ctx.response.body = { todo: updatedTodo });
  } catch (err) {
    console.log(err);
  }
};

export const removeTodos = async (ctx: RouterContext) => {
  try {
    const { _id } = ctx.params;

    const deletedTodo = await getDatabase()
      .collection<TodoSchema>("todos")
      .deleteOne({ _id: new Bson.ObjectId(_id) });

    return (ctx.response.body = { todos: deletedTodo });
  } catch (err) {
    console.log(err);
  }
};
