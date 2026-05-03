import { verify } from "jsonwebtoken";

const SECRET = "mysecret";

import {
  getAllUsers,
  getUserById,
  createUser,
} from "./src/userService";

export const server = Bun.serve({
  port: 3000,
  hostname: "127.0.0.1",
  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Health check (public)
    if (path === "/health" && method === "GET") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // JWT Authentication middleware for /api routes
    if (path.startsWith("/api")) {
      const auth = req.headers.get("authorization");
      if (!auth) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      try {
        const token = auth.split(" ")[1];
        verify(token, SECRET);
      } catch {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Get all users
    if (path === "/api/users" && method === "GET") {
      return new Response(JSON.stringify(getAllUsers()), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user by ID
    const userMatch = path.match(/^\/api\/users\/(\d+)$/);
    if (userMatch && method === "GET") {
      const id = parseInt(userMatch[1]);
      const user = getUserById(id);
      if (user) {
        return new Response(JSON.stringify(user), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create user
    if (path === "/api/users" && method === "POST") {
      return req.json().then((data: any) => {
        const newUser = createUser(data.name, data.email);
        return new Response(JSON.stringify(newUser), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      });
    }

    // Root endpoint
    if (path === "/" && method === "GET") {
      return new Response(
        JSON.stringify({
          message: "Welcome to Bun User Service",
          info: "All /api endpoints require JWT authentication",
          auth: "Get token from Auth Service at http://127.0.0.1:4000/login",
          endpoints: {
            health: "GET /health (no auth required)",
            users: "GET /api/users (auth required)",
            userById: "GET /api/users/:id (auth required)",
            createUser: "POST /api/users (auth required)",
          },
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`Server running at http://localhost:${server.port}`);