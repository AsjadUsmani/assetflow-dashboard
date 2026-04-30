import type { Asset } from "@/lib/services/assets";

export const ASSET_PRESET_FILTERS = ["missing-info", "warranty-ending-soon"] as const;

export type AssetPresetFilter = (typeof ASSET_PRESET_FILTERS)[number];

export function parseAssetPresetFilter(value: string | null): AssetPresetFilter | null {
  if (!value) return null;
  return ASSET_PRESET_FILTERS.includes(value as AssetPresetFilter)
    ? (value as AssetPresetFilter)
    : null;
}

export function hasMissingNonCompulsoryInfo(asset: Asset): boolean {
  const nonCompulsoryFields: unknown[] = [
    asset.serial_number,
    asset.asset_tag,
    asset.cost,
    asset.domain,
    asset.location_id,
    asset.department_id,
    asset.assigned_to_user_id,
    asset.managed_by_user_id,
    asset.purchase_date,
    asset.warranty_end_date,
    asset.assigned_date,
    asset.usage_type,
    asset.impact,
    asset.return_date,
    asset.remark,
  ];

  return nonCompulsoryFields.some((value) => {
    if (value == null) return true;
    if (typeof value === "string") return value.trim().length === 0;
    return false;
  });
}

export function isWarrantyEndingWithinDays(asset: Asset, days: number): boolean {
  if (!asset.warranty_end_date) return false;
  const warrantyEndDate = new Date(asset.warranty_end_date);
  if (Number.isNaN(warrantyEndDate.getTime())) return false;

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + days);

  return warrantyEndDate >= start && warrantyEndDate <= end;
}

export function matchesAssetPreset(asset: Asset, preset: AssetPresetFilter): boolean {
  if (preset === "missing-info") return hasMissingNonCompulsoryInfo(asset);
  return isWarrantyEndingWithinDays(asset, 30);
}
