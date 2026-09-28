import type { ProjectsResponse } from '../types/project';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface FetchProjectsParams {
  applyFilters?: boolean;
  forceRefresh?: boolean;
  useMock?: boolean;
  maxFdv?: number;
  search?: string;
}

export async function fetchProjects(params: FetchProjectsParams = {}): Promise<ProjectsResponse> {
  const query = new URLSearchParams();

  if (params.applyFilters !== undefined) {
    query.append('apply_filters', String(params.applyFilters));
  }
  if (params.forceRefresh) {
    query.append('force_refresh', 'true');
  }
  if (params.useMock) {
    query.append('use_mock', 'true');
  }
  if (params.maxFdv !== undefined) {
    query.append('max_fdv', String(params.maxFdv));
  }
  if (params.search) {
    query.append('search', params.search);
  }

  const url = `${API_BASE_URL}/projects${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch projects (${response.status}: ${response.statusText})`);
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
