import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";
import { Skeleton } from "../../components/loading";
import { CreateWorkoutModal } from "../../components/modals/CreateWorkoutModal";
import type { WorkoutRecord } from "../../services/workouts.service";

export function TreinosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: workouts, loading } = useFirestoreCollection<WorkoutRecord>({
    path: user ? `users/${user.uid}/workouts` : "users/__placeholder__/workouts",
    orderByField: "name",
    orderByDirection: "asc",
  });

  const handleCreateSuccess = (workoutId: string) => {
    setIsCreateOpen(false);
    navigate(`/treinos/${workoutId}`);
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
        </header>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-3xl font-semibold text-white">Treinos</h1>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <Plus className="h-4 w-4" />
              Novo treino
            </button>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            {workouts.length === 0
              ? "Nenhum treino"
              : `${workouts.length} treino${workouts.length !== 1 ? "s" : ""}`}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {workouts.map((workout) => (
              <button
                key={workout.id}
                type="button"
                onClick={() => navigate(`/treinos/${workout.id}`)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background-card p-4 text-left shadow-card transition hover:border-primary/40 hover:bg-background-elevated/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <span className="font-medium text-white">{workout.name}</span>
              </button>
            ))}
          </div>
        </section>
      </section>

      <CreateWorkoutModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
