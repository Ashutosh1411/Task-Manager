"use server";

import { getApiClient } from "@/lib/apiClient";

export async function getAuditLogs(limit: number = 20) {
  const api = await getApiClient();
  const { data } = await api.get("/audit", { params: { limit } });
  return data;
}

export async function getDashboardStats() {
  const api = await getApiClient();
  const { data } = await api.get("/audit/stats");
  return data;
}

export async function getUsers() {
  const api = await getApiClient();
  const { data } = await api.get("/audit/users");
  return data;
}
