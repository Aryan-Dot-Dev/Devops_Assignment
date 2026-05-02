interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
];

const server = Bun.serve({
  port: 3000,
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
      return new Response(JSON.stringify(users), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user by ID
    const userMatch = path.match(/^\/api\/users\/(\d+)$/);
    if (userMatch && method === "GET") {
      const id = parseInt(userMatch[1]);
      const user = users.find((u) => u.id === id);
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
    // if (path === "/api/users" && method === "POST") {
    //   return req.json().then((data: any) => {
    //     const newUser: User = {
    //       id: Math.max(...users.map((u) => u.id), 0) + 1,
    //       name: data.name,
    //       email: data.email,
    //     };
    //     users.push(newUser);
    //     return new Response(JSON.stringify(newUser), {
    //       status: 201,
    //       headers: { "Content-Type": "application/json" },
    //     });
    //   });
    // }

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