# hono-bun-tasks-manager
Hono &amp; Bun Task API This project is a RESTful API for user and task management, built using the Hono framework and the Bun runtime. It is designed to be a lightweight, fast, and modern backend solution with built-in features for validation and authentication. Protected routes.

🚀 Features
## Hono Framework: A fast, lightweight, and modern web framework for the Bun runtime.

## Bun Runtime: A blazingly fast all-in-one JavaScript runtime.

## Database: Uses SQLite for data persistence.

## Authentication: Secure user authentication using JSON Web Tokens (JWT).

## Middleware: Utilizes hono/cors for Cross-Origin Resource Sharing and hono/logger for request logging.

## Input Validation: Enforces request body schemas using Zod and the @hono/zod-validator middleware.

## Task Management: Provides full CRUD (Create, Read, Update, Delete) functionality for tasks.

## User Authentication: Includes endpoints for user registration and login.

📦 Prerequisites
Before running this project, ensure you have the Bun runtime installed on your system.

### Bun: Installation Guide

🏁 Getting Started
Follow these steps to set up and run the project locally.

* Clone the repository:

git clone git@github.com:timaZhuk/hono-bun-tasks-manager.git](git@github.com:timaZhuk/hono-bun-tasks-manager.git)
cd hono-bun-tasks

* Install dependencies: Bun will handle the installation of all required packages.

bun install

* Create .env file: Create a .env file in the project's root directory and add your JWT secret.

JWT_SECRET="your_secret_key_here"

* It's recommended to use a long, random string for your secret key.

* Run the application: Bun will start the server in watch mode, which will automatically restart on file changes.

bun run dev

The API will be running at http://localhost:3000.

⚙️ API Endpoints
The API provides the following endpoints. Endpoints marked with (Auth) require a valid JWT in the Authorization header with the Bearer scheme.

### Authentication
Method

Path

Description

POST

/register-user

### Registers a new user.

POST

/login

### Logs in an existing user and returns a JWT.

## Tasks (CRUD)
Method

Path

Description

POST

/tasks

### (Auth) Creates a new task.

GET

/tasks

### (Auth) Retrieves all tasks.

GET

/tasks/:id

### (Auth) Retrieves a single task by its ID.

PUT

/tasks/:id

### (Auth) Updates an existing task by its ID.

DELETE

/tasks/:id

### (Auth) Deletes a task by its ID.

Utility
Method

Path

Description

GET

/db-test

## Tests the database connection and returns the SQLite version.

📐 Data Schemas (Zod)
* The API uses Zod for request body validation. Here are the expected schemas for the main endpoints:

User Registration
{
  "username": "string",  // Min 3, max 25 characters
  "password": "string",  // Min 5 characters
  "role": "string"       // Optional, must be "user" or "admin"
}

User Login
{
  "username": "string",
  "password": "string"
}

Task
{
  "title": "string",       // Min 1, max 100 characters
  "description": "string", // Optional
  "user_id": "number"      // Must be a positive integer
}

