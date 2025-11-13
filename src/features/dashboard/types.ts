export interface DashboardPeriodization {
  id: string;
  name: string;
  status: "active" | "completed" | "upcoming";
  startDate: string;
  durationDays: number;
  progressPercent: number;
  stats: {
    days: number;
    newPrs: number;
    volumeChangePercent: number;
  };
}

export interface DashboardVolumePoint {
  label: string;
  volume: number;
}

export interface DashboardQuickStat {
  label: string;
  value: string;
  hint?: string;
}

export interface DashboardSummary {
  periodization: DashboardPeriodization | null;
  volumeSeries: DashboardVolumePoint[];
  quickStats: DashboardQuickStat[];
}
