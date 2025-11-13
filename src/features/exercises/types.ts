export type ExerciseTrend = "up" | "down" | "steady";

export interface ExercisePR {
  id: string;
  weight: number;
  reps: number;
  volume: number;
  date: string;
  periodization: string;
  trend?: ExerciseTrend;
}

export interface ExerciseSummary {
  id: string;
  name: string;
  muscles: string[];
  weightType?: "total" | "per-side";
  currentPr: {
    weight: number;
    reps: number;
    volume: number;
    date: string;
    periodization: string;
  };
  insights: string[];
  trendSeries: Array<{
    id: string;
    date: string;
    weight: number;
    reps: number;
    volume: number;
  }>;
  history: ExercisePR[];
}
