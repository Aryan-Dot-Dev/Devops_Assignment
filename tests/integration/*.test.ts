import { test, expect, afterAll } from "bun:test";
import { server } from "../../app/index";

const baseUrl = `http://localhost:${server.port}`;

afterAll(() => {
  server.stop();
});

test("GET /health", async () => {
  const res = await fetch(`${baseUrl}/health`);
  const data = await res.json();

  expect(res.status).toBe(200);
  expect(data.status).toBe("ok");
});

test("GET /api/users", async () => {
  const res = await fetch(`${baseUrl}/api/users`);
  const data = await res.json();

  expect(res.status).toBe(200);
  expect(Array.isArray(data)).toBe(true);
});

test("GET /api/users/1", async () => {
  const res = await fetch(`${baseUrl}/api/users/1`);
  const data = await res.json();

  expect(res.status).toBe(200);
  expect(data.id).toBe(1);
});

test("POST /api/users", async () => {
  const res = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Integration User",
      email: "int@test.com",
    }),
  });

  const data = await res.json();

  expect(res.status).toBe(201);
  expect(data.name).toBe("Integration User");
});

test("GET invalid route returns 404", async () => {
  const res = await fetch(`${baseUrl}/invalid`);
  expect(res.status).toBe(404);
});
