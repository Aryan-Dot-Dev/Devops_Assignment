import { sign } from "jsonwebtoken";

const SECRET = "mysecret";

Bun.serve({
  port: 4000,
  hostname: "0.0.0.0",
  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Login endpoint
    if (req.method === "POST" && path === "/login") {
      try {
        return req.json().then(
          (data: any) => {
            if (!data || typeof data !== "object") {
              return new Response(
                JSON.stringify({ error: "Request body must be a JSON object" }),
                {
                  status: 400,
                  headers: { "Content-Type": "application/json" },
                }
              );
            }
            if (!data.username || typeof data.username !== "string") {
              return new Response(
                JSON.stringify({
                  error: "Username is required and must be a string",
                }),
                {
                  status: 400,
                  headers: { "Content-Type": "application/json" },
                }
              );
            }
            const token = sign({ user: data.username }, SECRET, {
              expiresIn: "1h",
            });
            return new Response(JSON.stringify({ token }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          },
          (err: any) => {
            console.error("JSON parse error:", err.message);
            return new Response(
              JSON.stringify({
                error: "Invalid JSON in request body",
                details: err.message,
              }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        );
      } catch (err: any) {
        console.error("Unexpected error:", err);
        return new Response(
          JSON.stringify({
            error: "Internal server error",
            details: err.message,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Health check
    if (path === "/health" && req.method === "GET") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log("✓ Auth Service running on http://0.0.0.0:4000");
