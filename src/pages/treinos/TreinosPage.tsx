import { useState, useMemo } from "react";
import { GripVertical, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useAuth } from "../../contexts/AuthContext";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";
import { Skeleton } from "../../components/loading";
import { CreateWorkoutModal } from "../../components/modals/CreateWorkoutModal";
import {
  type WorkoutRecord,
  reorderWorkouts,
} from "../../services/workouts.service";

function SortableWorkoutCard({
  workout,
  onNavigate,
}: {
  workout: WorkoutRecord;
  onNavigate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workout.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-2xl border border-border bg-background-card p-4 shadow-card transition hover:border-primary/40 hover:bg-background-elevated/50 focus-within:ring-2 focus-within:ring-primary/40 ${
        isDragging ? "z-10 opacity-90 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        aria-label="Arrastar para reordenar"
        className="touch-none cursor-grab rounded-lg p-1.5 text-text-muted transition hover:bg-background-elevated hover:text-white active:cursor-grabbing"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onNavigate}
        className="min-w-0 flex-1 text-left font-medium text-white transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background-card rounded-lg py-1"
      >
        {workout.name}
      </button>
    </div>
  );
}

export function TreinosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [localWorkouts, setLocalWorkouts] = useState<WorkoutRecord[] | null>(null);

  const { data: workoutsFromFirestore, loading } = useFirestoreCollection<WorkoutRecord>({
    path: user ? `users/${user.uid}/workouts` : "users/__placeholder__/workouts",
    orderByField: "name",
    orderByDirection: "asc",
  });

  const workouts = useMemo(() => {
    const list = localWorkouts ?? workoutsFromFirestore;
    return [...list].sort(
      (a, b) =>
        (a.order ?? 999999) - (b.order ?? 999999) ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [localWorkouts, workoutsFromFirestore]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !user) return;

    const oldIndex = workouts.findIndex((w) => w.id === active.id);
    const newIndex = workouts.findIndex((w) => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(workouts, oldIndex, newIndex);
    setLocalWorkouts(reordered);

    try {
      await reorderWorkouts(user.uid, reordered.map((w) => w.id));
      setLocalWorkouts(null);
    } catch (err) {
      console.error("Erro ao reordenar treinos:", err);
      setLocalWorkouts(null);
    }
  };

  const handleCreateSuccess = (workoutId: string) => {
    setIsCreateOpen(false);
    setLocalWorkouts(null);
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
          <div className="space-y-3">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={workouts.map((w) => w.id)}
                strategy={verticalListSortingStrategy}
              >
                {workouts.map((workout) => (
                  <SortableWorkoutCard
                    key={workout.id}
                    workout={workout}
                    onNavigate={() => navigate(`/treinos/${workout.id}`)}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
