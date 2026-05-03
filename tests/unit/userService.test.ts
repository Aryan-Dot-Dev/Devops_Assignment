import { test, expect } from "bun:test";
import {
  getAllUsers,
  getUserById,
  createUser,
} from "../../app/src/userService";

test("getAllUsers returns array", () => {
  const users = getAllUsers();
  expect(Array.isArray(users)).toBe(true);
  expect(users.length).toBeGreaterThan(0);
});

test("getAllUsers returns users with correct structure", () => {
  const users = getAllUsers();
  users.forEach((user) => {
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("email");
    expect(typeof user.id).toBe("number");
    expect(typeof user.name).toBe("string");
    expect(typeof user.email).toBe("string");
  });
});

test("getUserById returns correct user", () => {
  const user = getUserById(1);
  expect(user).toBeDefined();
  expect(user?.id).toBe(1);
  expect(user?.name).toBe("John Doe");
  expect(user?.email).toBe("john@example.com");
});

test("getUserById returns undefined for invalid id", () => {
  const user = getUserById(999);
  expect(user).toBeUndefined();
});

test("createUser adds a new user with auto-incremented id", () => {
  const initialCount = getAllUsers().length;
  const user = createUser("Test User", "test@example.com");
  const finalCount = getAllUsers().length;

  expect(user).toBeDefined();
  expect(user.id).toBeDefined();
  expect(typeof user.id).toBe("number");
  expect(user.name).toBe("Test User");
  expect(user.email).toBe("test@example.com");
  expect(finalCount).toBeGreaterThan(initialCount);
});

test("createUser generates unique ids", () => {
  const user1 = createUser("User One", "user1@test.com");
  const user2 = createUser("User Two", "user2@test.com");

  expect(user1.id).not.toBe(user2.id);
  expect(user2.id).toBeGreaterThan(user1.id);
});
