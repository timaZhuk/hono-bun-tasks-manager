import { Hono } from "hono";
import { initDatabase } from "./database/db";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { loginUser, registerUser } from "./controllers/auth";
import { jwt } from "hono/jwt";
import {
  createTask,
  deleteATask,
  getAllTasks,
  getTask,
  updateATask,
} from "./controllers/task";

const app = new Hono();

//middleware for all routes
app.use("*", cors());
app.use("*", logger());

//auth secret
const auth = jwt({
  secret: process.env.JWT_SECRET || "JWT_SECRET",
});

//create db
const db = initDatabase();

//Input validation
const registerSchema = z.object({
  username: z.string().min(3).max(25),
  password: z.string().min(5),
  role: z.enum(["user", "admin"]).optional(),
});
//Login validation
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

//Task validation
const taskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  user_id: z.number().int().positive(),
});

//GET main page
app.get("/", (c) => {
  return c.text("Hello Hono and Bun project with Users and Tasks!");
});

//--AUTH routes
//POST SIGN UP user
app.post("/register-user", zValidator("json", registerSchema), (c) =>
  registerUser(c, db)
);
//POST LOGIN user
app.post("/login", zValidator("json", loginSchema), (c) => loginUser(c, db));

//---task routes
//Post create task
app.post("/tasks", auth, zValidator("json", taskSchema), (c) =>
  createTask(c, db)
);
//GET ALL tasks
app.get("/tasks", auth, (c) => getAllTasks(c, db));
//GET task by id
app.get("/tasks/:id", auth, (c) => getTask(c, db));
//PUT update a task
app.put("/tasks/:id", auth, zValidator("json", taskSchema), (c) =>
  updateATask(c, db)
);
//Delete a task
app.delete("/tasks/:id", auth, (c) => deleteATask(c, db));

//GET test return DB version
app.get("/db-test", (c) => {
  const result = db.query("SELECT sqlite_version()").get();

  return c.json({
    message: "Database connected successfully",
    sqlite_version: result,
  });
});

export default app;
