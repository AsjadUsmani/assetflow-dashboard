export type PaginationState = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

export type PaginatedResponse<T> = {
  items: T[];
  pagination: PaginationState;
}

export type ListPaginationQuery = {
  page?: number;
  limit?: number;
  search?: string;
}

export function buildPaginationQuery(query: Record<string, string | number | boolean | null | undefined>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue
    params.set(key, String(value))
  }
  const search = params.toString()
  return search ? `?${search}` : ""
}
