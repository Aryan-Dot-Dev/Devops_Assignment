export interface User {
  id: number;
  name: string;
  email: string;
}

export const users: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
];

export function getAllUsers() {
  return users;
}

export function getUserById(id: number) {
  return users.find((u) => u.id === id);
}

export function createUser(name: string, email: string) {
  const newUser: User = {
    id: Math.max(...users.map((u) => u.id), 0) + 1,
    name,
    email,
  };
  users.push(newUser);
  return newUser;
}
