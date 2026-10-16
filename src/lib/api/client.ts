import { authHeaders } from "@/lib/auth/client";
import type { Item, ItemPayload } from "@/types/item";

type ApiResponse<T> = T & { error?: string };

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(path, { headers: authHeaders(token) });
  const data = (await res.json()) as ApiResponse<T>;
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição.");
  return data as T;
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as ApiResponse<T>;
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição.");
  return data as T;
}

export async function apiPut<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as ApiResponse<T>;
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição.");
  return data as T;
}

export async function apiDelete<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(path, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const data = (await res.json()) as ApiResponse<T>;
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição.");
  return data as T;
}

export async function createItemApi(payload: ItemPayload): Promise<{ item: Item }> {
  return apiPost("/api/items", payload);
}

export async function updateItemApi(id: string, payload: ItemPayload): Promise<{ item: Item }> {
  return apiPut(`/api/items/${id}`, payload);
}

export async function deleteItemApi(id: string): Promise<{ ok: true }> {
  return apiDelete(`/api/items/${id}`);
}

export async function baixaItemApi(id: string, quantidade: number): Promise<{ saldo: number }> {
  return apiPost(`/api/items/${id}/baixa`, { quantidade });
}
