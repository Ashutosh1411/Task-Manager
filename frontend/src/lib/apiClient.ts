import axios from "axios";
import { auth } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function getApiClient() {
  let token: string | undefined;

  try {
    const session: any = await auth();
    token = session?.accessToken;
  } catch (e) {
    // Not in a server context where auth() works
  }

  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return instance;
}

// Keep a simple unauthenticated client for login flow etc.
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
