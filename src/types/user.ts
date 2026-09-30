import type { Models } from "appwrite";

export interface AppUser extends Models.Row {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
}