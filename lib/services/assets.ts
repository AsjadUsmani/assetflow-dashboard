import { apiService } from "./api-service"

export type Asset = {
  id: number
  asset_type_id: number
  asset_type_name: string
  name: string
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
  managed_by_user_id: number | null
  managed_by_user_name: string | null
  created_by_user_id: number | null
  created_by_name: string | null
  purchase_date: string | null
  warranty_end_date: string | null
  expiry_date: string | null
  assigned_date: string | null
  usage_type: string | null
  impact: string | null
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

export type CreateAssetBody = {
  asset_type_id: number
  name: string
  serial_number?: string
  asset_tag?: string
  cost?: number
  domain?: string
  status?: string
  location_id?: number
  department_id?: number
  assigned_to_user_id?: number
  managed_by_user_id?: number
  purchase_date?: string
  warranty_end_date?: string
  expiry_date?: string
  assigned_date?: string
  usage_type?: string
  impact?: string
  remark?: string
  property_values?: Record<string, unknown>
}

export type UpdateAssetBody = {
  name?: string
  serial_number?: string | null
  status?: string
  location_id?: number | null
  department_id?: number | null
  assigned_to_user_id?: number | null
  managed_by_role_id?: number | null
  purchase_date?: string | null
  warranty_end_date?: string | null
  expiry_date?: string | null
  property_values?: Record<string, unknown> | null
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
