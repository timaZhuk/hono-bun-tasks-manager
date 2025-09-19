import type { Context } from "hono";
import { Database } from "bun:sqlite";
import { Task } from "../types";

export async function createTask(c: Context, db: Database) {
  //from auth middleware (provide token and decode it)
  //fetch userId and role
  const userId = c.get("jwtPayload").userId;
  const userRole = c.get("jwtPayload").role;
  //request body data
  const { title, description, user_id } = await c.req.json();

  if (userRole !== "admin") {
    return c.json(
      {
        error: "Unauthorized! Only admin users can create a task",
      },
      403
    );
  }

  if (!userId) {
    return c.json(
      {
        error: "Unauthenticated! You need to login to create a task",
      },
      403
    );
  }

  if (user_id !== userId) {
    return c.json(
      {
        error: "wrong Id! You need to login as admin to create a task",
      },
      403
    );
  }
  try {
    //insert data into the DB
    const result = db
      .query(
        `
      INSERT INTO tasks (user_id, title, description) VALUES (?,?,?) RETURNING *
  `
      )
      .get(user_id, title, description) as Task | undefined;

    return c.json(result, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

//---get all tasks
export async function getAllTasks(c: Context, db: Database) {
  try {
    const extractAllTasks = db.query("SELECT * FROM tasks").all() as Task[];

    return c.json({ extractAllTasks }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

//--GET a single task by Id
export async function getTask(c: Context, db: Database) {
  const taskId = c.req.param("id");

  try {
    const extractSingleTask = db
      .query("SELECT * FROM tasks WHERE id = ?")
      .get(taskId) as Task | undefined;

    if (!extractSingleTask) {
      return c.json(
        {
          error: "Task not found! Please try again",
        },
        404
      );
    }

    return c.json(extractSingleTask, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

//Update tasks (only admins)
export async function updateATask(c: Context, db: Database) {
  const userId = c.get("jwtPayload").userId;
  const userRole = c.get("jwtPayload").role;
  const taskId = c.req.param("id");
  const { title, description, user_id } = await c.req.json();

  if (userRole !== "admin") {
    return c.json(
      {
        error: "Unauthorized! Only admin users can update a task",
      },
      403
    );
  }

  if (!userId) {
    return c.json(
      {
        error: "Unauthenticated! You need to login to update a task",
      },
      403
    );
  }

  //Only owner of task can update a task
  if (user_id !== userId) {
    return c.json(
      {
        error: "wrong Id! You need to login as admin to update a task",
      },
      403
    );
  }

  try {
    const extractExistingTask = db
      .query("SELECT * FROM tasks WHERE id = ?")
      .get(taskId) as Task | undefined;

    if (!extractExistingTask) {
      return c.json(
        {
          error: "Task not found! Please try again",
        },
        404
      );
    }
    //---
    const updatedTask = db
      .query(
        `
  UPDATE tasks
  SET title = ?, description = ?, user_id = ?
  WHERE id = ?
  RETURNING *
  `
      )
      .get(
        title || extractExistingTask.title,
        description !== undefined
          ? description
          : extractExistingTask.description,
        user_id === userId ? userId : extractExistingTask.user_id,
        taskId
      ) as Task;

    return c.json(updateATask, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

//DElETE a task

export async function deleteATask(c: Context, db: Database) {
  const userId = c.get("jwtPayload").userId;
  const userRole = c.get("jwtPayload").role;
  const taskId = c.req.param("id");
  const { user_id } = await c.req.json();

  if (userRole !== "admin") {
    return c.json(
      {
        error: "Unauthorized! Only admin users can update a task",
      },
      403
    );
  }

  if (!userId) {
    return c.json(
      {
        error: "Unauthenticated! You need to login to update a task",
      },
      403
    );
  }

  //Only owner of task can update a task
  if (user_id !== userId) {
    return c.json(
      {
        error: "wrong Id! You need to login as admin to update a task",
      },
      403
    );
  }
  try {
    const deletedTask = db.query("DELETE FROM tasks WHERE id = ?").run(taskId);
    if (deletedTask.changes === 0) {
      return c.json(
        {
          error: "Task not found! Please try again",
        },
        404
      );
    }

    return c.json({ message: "Task not found! Please try again" });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}
