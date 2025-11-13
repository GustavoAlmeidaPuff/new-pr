import { Plus } from "lucide-react";

import { ExerciseSearchResults } from "../../features/workouts/components/ExerciseSearchResults";
import { WorkoutCard } from "../../features/workouts/components/WorkoutCard";
import { WorkoutSearchInput } from "../../features/workouts/components/WorkoutSearchInput";
import { useWorkoutsData } from "../../features/workouts/hooks/useWorkoutsData";

export function WorkoutsPage() {
  const { workouts, exercises, searchTerm, setSearchTerm } = useWorkoutsData();

  const handleCreateWorkout = () => {
    // TODO: abrir modal para criar novo treino via Firestore.
    console.info("Criar treino acionado");
  };

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Treinos</h1>
            <p className="text-sm text-text-muted">
              Organize seus treinos por periodização e encontre exercícios rapidamente.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateWorkout}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Novo treino
          </button>
        </div>
        <WorkoutSearchInput value={searchTerm} onChange={setSearchTerm} />
      </header>

      <ExerciseSearchResults results={exercises} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Seus treinos
        </h2>
        <div className="grid gap-4">
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      </section>
    </section>
  );
}

