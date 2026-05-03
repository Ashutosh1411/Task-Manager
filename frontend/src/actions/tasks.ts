"use server";

import { getApiClient } from "@/lib/apiClient";
import { revalidatePath } from "next/cache";

export async function getTasks(params?: {
  projectId?: string;
  search?: string;
  status?: string;
  assignedTo?: string;
  page?: number;
  pageSize?: number;
}) {
  const api = await getApiClient();
  const { data } = await api.get("/tasks", { params });
  return data;
}

export async function getTasksByProject(projectId: string) {
  const api = await getApiClient();
  const { data } = await api.get(`/tasks/project/${projectId}`);
  return data;
}

export async function createTask(taskData: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId: string;
  assignedTo?: string;
}) {
  const api = await getApiClient();
  const { data } = await api.post("/tasks", taskData);
  revalidatePath("/tasks");
  revalidatePath(`/projects/${taskData.projectId}`);
  revalidatePath("/");
  return data;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const api = await getApiClient();
  const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
  revalidatePath("/tasks");
  revalidatePath(`/projects/${data.projectId}`);
  revalidatePath("/");
  return data;
}

export async function updateTask(
  taskId: string,
  updateData: {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    assignedTo?: string | null;
  }
) {
  const api = await getApiClient();
  const { data } = await api.patch(`/tasks/${taskId}`, updateData);
  revalidatePath("/tasks");
  revalidatePath(`/projects/${data.projectId}`);
  revalidatePath("/");
  return data;
}

export async function deleteTask(taskId: string) {
  const api = await getApiClient();
  await api.delete(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/");
}
