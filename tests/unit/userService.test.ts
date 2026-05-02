import { test, expect } from "bun:test";
import {
  getAllUsers,
  getUserById,
  createUser,
} from "../../app/src/userService";

test("getAllUsers returns array", () => {
  const users = getAllUsers();
  expect(Array.isArray(users)).toBe(true);
});

test("getUserById returns correct user", () => {
  const user = getUserById(1);
  expect(user?.id).toBe(1);
});

test("getUserById returns undefined for invalid id", () => {
  const user = getUserById(999);
  expect(user).toBeUndefined();
});

test("createUser adds a new user", () => {
  const user = createUser("Test", "test@example.com");
  expect(user.id).toBeDefined();
  expect(user.name).toBe("Test");
});
