"use server";

import { getApiClient } from "@/lib/apiClient";
import { Priority } from "@/types";

/**
 * Predicts task priority based on description using backend service.
 */
export async function predictPriority(description: string): Promise<Priority> {
  try {
    const api = await getApiClient();
    const { data } = await api.post("/nlp/predict-priority", { description });
    return data.priority as Priority;
  } catch (error) {
    console.error("Failed to predict priority via backend, defaulting to MEDIUM", error);
    return "MEDIUM" as Priority;
  }
}
