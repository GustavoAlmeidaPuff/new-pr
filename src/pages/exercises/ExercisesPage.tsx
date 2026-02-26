import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Skeleton } from "../../components/loading";
import { CreateExerciseModal } from "../../components/modals";
import { ExerciseListItem } from "../../features/exercises/components/ExerciseListItem";
import { useExercisesListData } from "../../features/exercises/hooks/useExercisesListData";
import { Search } from "lucide-react";

export function ExercisesPage() {
  const navigate = useNavigate();
  const { filteredExercises, searchTerm, setSearchTerm, loading } = useExercisesListData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSuccess = (exerciseId: string) => {
    setIsCreateModalOpen(false);
    navigate(`/exercicios/${exerciseId}`);
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-32 rounded-full" />
              <Skeleton className="h-4 w-64 rounded-full" />
            </div>
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
        </header>
        <section className="space-y-3">
          <Skeleton className="h-4 w-40 rounded-full" />
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        </section>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-3xl font-semibold text-white">Exercícios</h1>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <Plus className="h-4 w-4" />
              Novo exercício
            </button>
          </div>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
              aria-hidden
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou grupo muscular..."
              className="w-full rounded-full border border-border bg-background-elevated py-3 pl-12 pr-4 text-sm text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="Buscar exercícios"
            />
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            {filteredExercises.length === 0
              ? "Nenhum exercício"
              : `${filteredExercises.length} exercício${filteredExercises.length !== 1 ? "s" : ""}`}
          </h2>
          <div className="space-y-3">
            {filteredExercises.map((exercise) => (
              <ExerciseListItem key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </section>
      </section>

      <CreateExerciseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
