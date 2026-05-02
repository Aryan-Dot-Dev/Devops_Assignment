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

    // Health check
    if (path === "/health" && method === "GET") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
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
          message: "Welcome to Bun API",
          endpoints: {
            health: "GET /health",
            users: "GET /api/users",
            userById: "GET /api/users/:id",
            createUser: "POST /api/users",
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