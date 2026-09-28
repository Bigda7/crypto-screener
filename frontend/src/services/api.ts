import type { ProjectsResponse } from '../types/project';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function fetchProjects(): Promise<ProjectsResponse> {
  const response = await fetch(`${API_BASE_URL}/projects`);
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  return response.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
