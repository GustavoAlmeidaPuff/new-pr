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
  weekStart: string;
  weekEnd: string;
}

export interface DashboardWeeklySnapshot {
  index: number;
  label: string;
  weekStart: string;
  weekEnd: string;
  volume: number;
  prsCount: number;
}

export interface DashboardWeeklyStreak {
  currentPrStreak: number;
  longestPrStreak: number;
  currentLoadIncreaseStreak: number;
  weeks: DashboardWeeklySnapshot[];
}

export interface DashboardPRHistoryItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  volume: number;
  date: string;
  notes?: string;
}

export interface DashboardSummary {
  periodization: DashboardPeriodization | null;
  volumeSeries: DashboardVolumePoint[];
  weeklyStreak: DashboardWeeklyStreak | null;
  prHistory: DashboardPRHistoryItem[];
}
