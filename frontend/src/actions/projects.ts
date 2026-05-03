"use server";

import { getApiClient } from "@/lib/apiClient";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  const api = await getApiClient();
  const { data } = await api.get("/projects");
  return data;
}

export async function getProject(id: string) {
  try {
    const api = await getApiClient();
    const { data } = await api.get(`/projects/${id}`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createProject(projectData: {
  name: string;
  description?: string;
}) {
  const api = await getApiClient();
  const { data } = await api.post("/projects", projectData);
  revalidatePath("/projects");
  revalidatePath("/");
  return data;
}

export async function deleteProject(id: string) {
  const api = await getApiClient();
  await api.delete(`/projects/${id}`);
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function updateProject(id: string, projectData: {
  name: string;
  description?: string;
}) {
  const api = await getApiClient();
  const { data } = await api.patch(`/projects/${id}`, projectData);
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/");
  return data;
}
