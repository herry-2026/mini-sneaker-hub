import mockData from '../mock/hot.json';
import type { AllHotResponse, HotPlatform } from '../types/hot';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`);
  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchAllHot(): Promise<AllHotResponse> {
  try {
    return await fetchJson<AllHotResponse>('/api/hot');
  } catch {
    return mockData as AllHotResponse;
  }
}

export async function fetchHotBySource(source: string): Promise<HotPlatform> {
  try {
    return await fetchJson<HotPlatform>(`/api/hot/${source}`);
  } catch {
    const platform = (mockData as AllHotResponse).find((item) => item.source === source);
    if (!platform) {
      throw new Error(`未找到平台: ${source}`);
    }
    return platform;
  }
}

export function getMockHotData(): AllHotResponse {
  return mockData as AllHotResponse;
}
