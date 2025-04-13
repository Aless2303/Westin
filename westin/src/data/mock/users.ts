export interface User {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
  characterId: string; // Reference to the character that this user plays with
}

export const users: User[] = [
  {
    id: "user1",
    username: "user",
    password: "user123",
    isAdmin: false,
    characterId: "ravensword", // Assuming this is the ID of the Ravensword character
  },
  {
    id: "admin1",
    username: "admin",
    password: "admin123",
    isAdmin: true,
    characterId: "ravensword", // Same character for admin
  }
];

// Function to authenticate a user
export const authenticateUser = (username: string, password: string): User | null => {
  return users.find(
    (user) => user.username === username && user.password === password
  ) || null;
};

// Function to check if a user is an admin
export const isAdminUser = (userId: string): boolean => {
  const user = users.find((user) => user.id === userId);
  return user ? user.isAdmin : false;
} 