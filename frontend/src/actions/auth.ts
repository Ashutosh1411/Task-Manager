"use server";

import { signIn, signOut } from "@/lib/auth";
import apiClient from "@/lib/apiClient";

export async function loginAction(email: string, password: string) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Invalid email or password" };
  }
}

export async function registerAction(name: string, email: string, password: string) {
  try {
    // 1. Create the user in the backend
    await apiClient.post("/auth/register", { name, email, password });

    // 2. Log them in automatically
    return await loginAction(email, password);
  } catch (error: any) {
    const message = error.response?.data?.error || "Registration failed";
    return { success: false, error: message };
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
}
