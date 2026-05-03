import { test, expect } from "bun:test";

const authBaseUrl = "http://127.0.0.1:4000";

// Auth Service Tests
test("Auth: GET /health returns ok status", async () => {
  const res = await fetch(`${authBaseUrl}/health`);
  const data = await res.json();

  expect(res.status).toBe(200);
  expect(data.status).toBe("ok");
});

test("Auth: POST /login with valid username returns token", async () => {
  const res = await fetch(`${authBaseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "testuser" }),
  });
  const data = await res.json();

  expect(res.status).toBe(200);
  expect(data.token).toBeDefined();
  expect(typeof data.token).toBe("string");
  expect(data.token.split(".").length).toBe(3); // Valid JWT format
});

test("Auth: POST /login without username returns 400", async () => {
  const res = await fetch(`${authBaseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const data = await res.json();

  expect(res.status).toBe(400);
  expect(data.error).toContain("Username is required");
});

test("Auth: POST /login with empty username returns 400", async () => {
  const res = await fetch(`${authBaseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "" }),
  });
  const data = await res.json();

  expect(res.status).toBe(400);
  expect(data.error).toContain("Username is required");
});

test("Auth: POST /login with non-string username returns 400", async () => {
  const res = await fetch(`${authBaseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: 123 }),
  });
  const data = await res.json();

  expect(res.status).toBe(400);
  expect(data.error).toContain("Username is required");
});

test("Auth: POST /login with invalid JSON returns 400", async () => {
  const res = await fetch(`${authBaseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{invalid json}",
  });
  const data = await res.json();

  expect(res.status).toBe(400);
  expect(data.error).toBeDefined();
});

test("Auth: Invalid route returns 404", async () => {
  const res = await fetch(`${authBaseUrl}/invalid`);
  const data = await res.json();

  expect(res.status).toBe(404);
  expect(data.error).toBe("Not found");
});

test("Auth: Tokens from different logins are different", async () => {
  const res1 = await fetch(`${authBaseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "user1" }),
  });
  const data1 = await res1.json();

  const res2 = await fetch(`${authBaseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "user2" }),
  });
  const data2 = await res2.json();

  expect(data1.token).not.toBe(data2.token);
});
