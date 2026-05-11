import { apiService } from "./api-service"

export type AssetRequest = {
  id: number
  request_number: string
  type: string
  status: string
  priority: string
  asset_id: number | null
  asset_name: string | null
  from_location_name: string | null
  to_location_name: string | null
  from_department_id: number | null
  to_department_id: number | null
  requested_by_id: number
  requested_by_name: string
  to_user_id: number | null
  to_user_name: string | null
  reason: string
  justification: string | null
  current_approval_level: string | null
  decision_comment: string | null
  decided_by_id: number | null
  decided_at: string | null
  created_at: string
  updated_at: string
}

export type ListRequestsQuery = {
  status?: string
  type?: string
}

export type CreateRequestBody = {
  type: string
  priority?: string
  asset_id?: number
  from_location_id?: number
  to_location_id?: number
  from_department_id?: number
  to_department_id?: number
  to_user_id?: number
  reason: string
  justification?: string
}

export type DecideRequestBody = {
  decision: "approve" | "reject"
  comment?: string
}

const BASE = "/workspace/requests"
export const CREATE_ASSET_NAME_MARKER = "[asset_name]"

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const CREATE_ASSET_NAME_REGEX = new RegExp(
  `^${escapeRegExp(CREATE_ASSET_NAME_MARKER)}([^\\n]+)\\n?`
)

function normalizeRequest(request: AssetRequest): AssetRequest {
  if (request.type !== "create" || request.asset_name || !request.justification) {
    return request
  }

  const match = request.justification.match(CREATE_ASSET_NAME_REGEX)
  if (!match) return request

  const assetName = match[1]?.trim() || null
  const cleanedJustification = request.justification.replace(CREATE_ASSET_NAME_REGEX, "").trim()

  return {
    ...request,
    asset_name: assetName,
    justification: cleanedJustification || null,
  }
}

function normalizeRequests(requests: AssetRequest[]): AssetRequest[] {
  return requests.map(normalizeRequest)
}

function buildQuery(q: ListRequestsQuery): string {
  const params = new URLSearchParams()
  if (q.status) params.set("status", q.status)
  if (q.type) params.set("type", q.type)
  const s = params.toString()
  return s ? `?${s}` : ""
}

export async function getRequests(query?: ListRequestsQuery): Promise<AssetRequest[]> {
  const url = query ? `${BASE}${buildQuery(query)}` : BASE
  const json = await apiService.get<AssetRequest[]>(url, true)
  return normalizeRequests(json.data ?? [])
}

export async function createRequest(body: CreateRequestBody): Promise<AssetRequest> {
  const json = await apiService.post<AssetRequest>(BASE, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to create request")
  return normalizeRequest(json.data)
}

export async function getRequestById(id: number): Promise<AssetRequest | null> {
  const json = await apiService.get<AssetRequest>(`${BASE}/${id}`, true)
  return json.data ? normalizeRequest(json.data) : null
}

export async function decideRequest(id: number, body: DecideRequestBody): Promise<AssetRequest> {
  const json = await apiService.post<AssetRequest>(`${BASE}/${id}/decision`, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to update request status")
  return normalizeRequest(json.data)
}

export async function deleteRequest(id: number): Promise<void> {
  await apiService.delete(`${BASE}/${id}`, true)
}

