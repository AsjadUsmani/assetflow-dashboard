import { apiService } from "./api-service"
import { buildPaginationQuery, type ListPaginationQuery, type PaginatedResponse } from "@/lib/services/pagination"

export type Asset = {
  id: number
  asset_type_id: number
  asset_type_name: string
  name: string
  host_name: string
  designation_id: number | null
  designation_name: string | null
  brand: string | null
  model_name: string | null
  serial_number: string | null
  asset_tag: string | null
  cost: number | null
  domain: string | null
  status: string
  location_id: number | null
  location_name: string | null
  department_id: number | null
  department_name: string | null
  assigned_to_user_id: number | null
  assigned_to_name: string | null
  assigned_to_username: string | null
  managed_by_user_id: number | null
  managed_by_user_name: string | null
  created_by_user_id: number | null
  created_by_name: string | null
  updated_by_user_id: number | null
  updated_by_name: string | null
  purchase_date: string | null
  warranty_end_date: string | null
  expiry_date: string | null
  assigned_date: string | null
  assignment_type: string | null
  usage_type: string | null
  impact: string | null
  return_date: string | null
  remark: string | null
  property_values: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type ListAssetsQuery = {
  assetType?: number
  status?: string
  location?: number
  department?: number
}

export type AssetListPageQuery = ListPaginationQuery & ListAssetsQuery

export type CreateAssetBody = {
  asset_type_id: number
  name: string
  host_name?: string
  designation_id?: number
  brand?: string
  model_name?: string
  serial_number?: string
  asset_tag?: string
  cost?: number
  domain?: string
  status?: string
  location_id?: number
  department_id?: number
  assigned_to_user_id?: number
  purchase_date?: string
  warranty_end_date?: string
  expiry_date?: string
  assigned_date?: string
  assignment_type?: string
  return_date?: string
  remark?: string
  property_values?: Record<string, unknown>
}

export type UpdateAssetBody = {
  name?: string
  host_name?: string
  designation_id?: number | null
  brand?: string | null
  model_name?: string | null
  serial_number?: string | null
  asset_tag?: string | null
  cost?: number | null
  domain?: string | null
  status?: string
  location_id?: number | null
  department_id?: number | null
  assigned_to_user_id?: number | null
  purchase_date?: string | null
  warranty_end_date?: string | null
  expiry_date?: string | null
  assigned_date?: string | null
  assignment_type?: string | null
  return_date?: string | null
  remark?: string | null
  property_values?: Record<string, unknown> | null
}

export type AssignmentHistoryEntry = {
  id: number
  asset_id: number
  asset_name: string | null
  previous_user_id: number | null
  previous_user_name: string | null
  assigned_to_user_id: number | null
  assigned_to_user_name: string | null
  previous_managed_by_user_id: number | null
  previous_managed_by_user_name: string | null
  managed_by_user_id: number | null
  managed_by_user_name: string | null
  changed_by_user_id: number | null
  changed_by_user_name: string | null
  changed_at: string
  note: string | null
}

const BASE = "/workspace/assets"

function buildQuery(q: ListAssetsQuery): string {
  const params = new URLSearchParams()
  if (q.assetType != null) params.set("assetType", String(q.assetType))
  if (q.status) params.set("status", q.status)
  if (q.location != null) params.set("location", String(q.location))
  if (q.department != null) params.set("department", String(q.department))
  const s = params.toString()
  return s ? `?${s}` : ""
}

export async function getAssets(query?: ListAssetsQuery): Promise<Asset[]> {
  const url = query ? `${BASE}${buildQuery(query)}` : BASE
  const json = await apiService.get<Asset[]>(url, true)
  return json.data ?? []
}

export async function getAssetsPage(query: AssetListPageQuery): Promise<PaginatedResponse<Asset>> {
  const url = `${BASE}${buildQuery(query)}${buildPaginationQuery(query)}`
  const json = await apiService.get<PaginatedResponse<Asset>>(url, true)
  return json.data ?? { items: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0, has_next_page: false, has_previous_page: false } }
}

export async function getAssetById(id: number): Promise<Asset | null> {
  const json = await apiService.get<Asset>(`${BASE}/${id}`, true)
  return json.data ?? null
}

export async function createAsset(body: CreateAssetBody): Promise<Asset> {
  const json = await apiService.post<Asset>(BASE, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to create asset")
  return json.data
}

export async function updateAsset(id: number, body: UpdateAssetBody): Promise<Asset> {
  const json = await apiService.put<Asset>(`${BASE}/${id}`, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to update asset")
  return json.data
}

export async function deleteAsset(id: number): Promise<void> {
  await apiService.delete(`${BASE}/${id}`, true)
}

export async function exportAssetsCsv(): Promise<Blob> {
  return apiService.getFile(`${BASE}/export-csv`)
}

export async function getAssignmentHistory(assetId?: number): Promise<AssignmentHistoryEntry[]> {
  const query = assetId != null ? `?asset_id=${assetId}` : ""
  const json = await apiService.get<AssignmentHistoryEntry[]>(`${BASE}/assignment-history${query}`, true)
  return json.data ?? []
}
