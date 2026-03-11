export interface DashboardFilterState {
  location: string;
  department: string;
  assetType: string;
  dateRange: string;
}

export const defaultDashboardFilters: DashboardFilterState = {
  location: "",
  department: "",
  assetType: "",
  dateRange: "30d",
};

export function getDateRangeStart(dateRange: string): Date | null {
  if (!dateRange || dateRange === "all") return null;

  const now = Date.now();
  if (dateRange === "1y") {
    return new Date(now - 365 * 24 * 60 * 60 * 1000);
  }

  const days = Number(dateRange.replace("d", ""));
  if (Number.isNaN(days) || days <= 0) return null;
  return new Date(now - days * 24 * 60 * 60 * 1000);
}

export function isInDateRange(dateValue: string | null, dateRange: string): boolean {
  if (!dateValue) return false;
  const start = getDateRangeStart(dateRange);
  if (!start) return true;
  return new Date(dateValue).getTime() >= start.getTime();
}
