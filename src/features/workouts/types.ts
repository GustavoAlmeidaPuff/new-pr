export interface Workout {
  id: string;
  name: string;
  description: string;
  exerciseCount: number;
}

export interface WorkoutExercisePreview {
  id: string;
  name: string;
  muscleGroup: string;
  weightType?: "total" | "per-side";
  workoutNames?: string[];
  lastPr?: {
    weight: number;
    reps: number;
    date: string;
    trend?: "up" | "down" | "steady";
  };
}
