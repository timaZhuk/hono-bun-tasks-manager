import type { Context } from "hono";
import { Database } from "bun:sqlite";
import { User } from "../types";
import { password as bunPassword } from "bun";
import { sign } from "hono/jwt";

// --- SIGN UP user
export async function registerUser(c: Context, db: Database) {
  //get the data from req body
  const { username, password, role = "user" } = await c.req.json();
  //--check out username and password
  if (!username || !password) {
    return c.json(
      {
        error: "Username and Password are required",
      },
      400
    );
  }

  //check the role field
  if (role !== "user" && role !== "admin") {
    return c.json(
      {
        error: "Invalid role",
      },
      400
    );
  }
  try {
    //check if user exists in DB
    const existingUser = db
      .query("SELECT * FROM users WHERE username = ?")
      .get(username) as User | undefined;

    if (existingUser) {
      return c.json(
        {
          error:
            "User is already exists with same username! Please try with another username",
        },
        400
      );
    }
    //hashing password
    const hashedPassword = await bunPassword.hash(password);
    //insert new user into DB
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
      username,
      hashedPassword,
      role,
    ]);

    return c.json(
      {
        message: "User registered successfully!",
      },
      201
    );
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

//LOGIN user
export async function loginUser(c: Context, db: Database) {
  const { username, password } = await c.req.json();
  if (!username || !password) {
    return c.json(
      {
        error: "Username and password are required!",
      },
      400
    );
  }
  try {
    //-- get user from db
    const user = db
      .query("SELECT * FROM users WHERE username = ?")
      .get(username) as User | undefined;

    if (!user) {
      return c.json(
        {
          error: "Invalid credentials",
        },
        401
      );
    }
    //-- verify the password user entered
    const isPasswordValid = await bunPassword.verify(password, user.password);
    if (!isPasswordValid) {
      return c.json({
        error: "Invalid password!Enter correct one!",
      });
    }
    //--create the Token
    const token = await sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET || "JWT_SECRET"
    );
    return c.json({ token });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}
