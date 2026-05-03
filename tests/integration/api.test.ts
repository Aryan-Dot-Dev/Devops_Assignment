import { test, expect, beforeAll, afterAll } from "bun:test";

let token: string;
let authAvailable = true;
const baseUrl = `http://localhost:3000`; // Connect to already-running server

beforeAll(async () => {
  // Get a valid token from auth service before running tests
  try {
    const authRes = await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "testuser" }),
    });
    const authData = await authRes.json();
    token = authData.token;
  } catch (err) {
    console.warn(
      "Could not connect to auth service, tests may fail for protected routes"
    );
    token = "dummy-token";
  }
});

afterAll(() => {
  // Don't stop the server - it's managed by Jenkins
});

// Public endpoints (no auth required)
test("GET / returns welcome message", async () => {
  const res = await fetch(`${baseUrl}/`);
  const data = await res.json();

  expect(res.status).toBe(200);
  expect(data.message).toBeDefined();
  expect(data.endpoints).toBeDefined();
});

test("GET /health returns ok status", async () => {
  const res = await fetch(`${baseUrl}/health`);
  const data = await res.json();

  expect(res.status).toBe(200);
  expect(data.status).toBe("ok");
});

// Protected endpoints (auth required)
test("GET /api/users without token returns 401", async () => {
  const res = await fetch(`${baseUrl}/api/users`);
  const data = await res.json();

  expect(res.status).toBe(401);
  expect(data.error).toBe("Unauthorized");
});

test("GET /api/users with invalid token returns 403", async () => {
  const res = await fetch(`${baseUrl}/api/users`, {
    headers: { Authorization: "Bearer invalid-token" },
  });
  const data = await res.json();

  expect(res.status).toBe(403);
  expect(data.error).toBe("Invalid token");
});

test("GET /api/users with valid token returns users", async () => {
  if (!authAvailable) {
    console.warn("⏭️  Skipping: Auth service unavailable");
    return;
  }

  const res = await fetch(`${baseUrl}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  expect(res.status).toBe(200);
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);
});

test("GET /api/users/:id with valid token returns correct user", async () => {
  if (!authAvailable) {
    console.warn("⏭️  Skipping: Auth service unavailable");
    return;
  }

  const res = await fetch(`${baseUrl}/api/users/1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  expect(res.status).toBe(200);
  expect(data.id).toBe(1);
  expect(data.name).toBeDefined();
  expect(data.email).toBeDefined();
});

test("GET /api/users/:id with invalid id returns 404", async () => {
  if (!authAvailable) {
    console.warn("⏭️  Skipping: Auth service unavailable");
    return;
  }

  const res = await fetch(`${baseUrl}/api/users/999`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  expect(res.status).toBe(404);
  expect(data.error).toBe("User not found");
});

test("POST /api/users creates new user with valid token", async () => {
  if (!authAvailable) {
    console.warn("⏭️  Skipping: Auth service unavailable");
    return;
  }

  const newUser = {
    name: "Integration Test User",
    email: "integration@test.com",
  };

  const res = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newUser),
  });

  const data = await res.json();

  expect(res.status).toBe(201);
  expect(data.id).toBeDefined();
  expect(data.name).toBe(newUser.name);
  expect(data.email).toBe(newUser.email);
});

test("POST /api/users without token returns 401", async () => {
  const newUser = {
    name: "Unauthorized User",
    email: "unauthorized@test.com",
  };

  const res = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });

  expect(res.status).toBe(401);
});

test("GET invalid route returns 404", async () => {
  const res = await fetch(`${baseUrl}/invalid-route`);
  const data = await res.json();

  expect(res.status).toBe(404);
  expect(data.error).toBe("Not found");
});
