import { apiService } from "./api-service"

export type AssetTypePropertySummary = {
  id: number
  name: string
  is_required?: boolean
  data_type?: string
  config?: Record<string, unknown> | null
}

export type AssetType = {
  id: number
  name: string
  code: string
  description: string | null
  created_at: string
  has_expiry: boolean
  is_rechargeable: boolean
  is_one_time_use: boolean
  is_movable: boolean
  requires_assignment: boolean
  properties: AssetTypePropertySummary[]
}

export type UpdateAssetTypeBody = {
  name?: string
  code?: string
  description?: string | null
  has_expiry?: boolean
  is_rechargeable?: boolean
  is_one_time_use?: boolean
  is_movable?: boolean
  requires_assignment?: boolean
  properties?: { property_id: number; is_required?: boolean; sort_order?: number }[]
}

export type CreateAssetTypeBody = {
  name: string
  code?: string
  description?: string | null
  has_expiry?: boolean
  is_rechargeable?: boolean
  is_one_time_use?: boolean
  is_movable?: boolean
  requires_assignment?: boolean
  properties?: { property_id: number; is_required?: boolean; sort_order?: number }[]
}

const BASE = "/workspace/asset-types"

export async function createAssetType(body: CreateAssetTypeBody): Promise<AssetType> {
  const json = await apiService.post<AssetType>(BASE, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to create asset type")
  return json.data
}

export async function getAssetTypes(): Promise<AssetType[]> {
  const json = await apiService.get<AssetType[]>(BASE, true)
  return json.data ?? []
}

export async function getAssetTypeById(id: number): Promise<AssetType | null> {
  const json = await apiService.get<AssetType>(`${BASE}/${id}`, true)
  return json.data ?? null
}

export async function updateAssetType(id: number, body: UpdateAssetTypeBody): Promise<AssetType> {
  const json = await apiService.put<AssetType>(`${BASE}/${id}`, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to update asset type")
  return json.data
}

export async function duplicateAssetType(id: number): Promise<AssetType> {
  const json = await apiService.post<AssetType>(`${BASE}/${id}/duplicate`, {}, true)
  if (!json.data) throw new Error(json.message ?? "Failed to duplicate asset type")
  return json.data
}

export async function deleteAssetType(id: number): Promise<void> {
  const json = await apiService.delete<{ id: number }>(`${BASE}/${id}`, true)
  if (!json.success) throw new Error(json.message ?? "Failed to delete asset type")
}

