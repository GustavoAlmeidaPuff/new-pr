export type PeriodizationStatus = "active" | "completed" | "upcoming";

export interface Periodization {
  id: string;
  name: string;
  status: PeriodizationStatus;
  startDate: string;
  durationDays: number;
  completedAt?: string;
  prs: number;
  progressPercent: number;
}
