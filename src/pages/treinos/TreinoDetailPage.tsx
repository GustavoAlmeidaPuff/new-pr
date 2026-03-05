import { useState } from "react";
import { ArrowLeft, GripVertical, Plus, Trash2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Skeleton } from "../../components/loading";
import { AddExerciseToWorkoutModal } from "../../components/modals/AddExerciseToWorkoutModal";
import {
  removeExerciseFromWorkout,
  reorderWorkoutExercises,
} from "../../services/workouts.service";
import {
  useTreinoDetailData,
  type TreinoExerciseItem,
} from "../../features/treinos/hooks/useTreinoDetailData";

function SortableExerciseRow({
  item,
  onNavigate,
  onRemove,
  removingId,
}: {
  item: TreinoExerciseItem;
  onNavigate: () => void;
  onRemove: () => void;
  removingId: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.workoutExerciseId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-3 rounded-2xl border border-border bg-background-card p-4 ${
        isDragging ? "z-10 opacity-90 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        aria-label="Arrastar para reordenar"
        className="touch-none shrink-0 cursor-grab rounded-lg p-1.5 text-text-muted transition hover:bg-background-elevated hover:text-white active:cursor-grabbing"
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
        {item.name}
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={removingId === item.exerciseId}
        className="shrink-0 rounded-lg p-2 text-text-muted transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
        aria-label={`Remover ${item.name} do treino`}
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </li>
  );
}

export function TreinoDetailPage() {
  const { workoutId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { workout, exercises, loading, refresh } = useTreinoDetailData(workoutId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [localExercises, setLocalExercises] = useState<TreinoExerciseItem[] | null>(null);

  const displayExercises = localExercises ?? exercises;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !user || !workoutId) return;

    const oldIndex = displayExercises.findIndex((e) => e.workoutExerciseId === active.id);
    const newIndex = displayExercises.findIndex((e) => e.workoutExerciseId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(displayExercises, oldIndex, newIndex);
    setLocalExercises(reordered);

    try {
      await reorderWorkoutExercises(
        user.uid,
        workoutId,
        reordered.map((e) => e.workoutExerciseId)
      );
      setLocalExercises(null);
      refresh();
    } catch (err) {
      console.error("Erro ao reordenar exercícios:", err);
      setLocalExercises(null);
    }
  };

  const handleRemove = async (exerciseId: string) => {
    if (!user || !workoutId) return;
    if (!window.confirm("Remover este exercício do treino?")) return;
    setRemovingId(exerciseId);
    setLocalExercises(null);
    try {
      await removeExerciseFromWorkout(user.uid, workoutId, exerciseId);
      refresh();
    } catch (err) {
      console.error("Erro ao remover exercício:", err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!workout) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-text-muted">
        Treino não encontrado.
      </div>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <header className="space-y-3">
          <button
            type="button"
            onClick={() => navigate("/treinos")}
            className="flex items-center gap-2 text-sm font-medium text-text-muted transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos treinos
          </button>
          <h1 className="text-3xl font-semibold text-white">{workout.name}</h1>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            {exercises.length === 0
              ? "Nenhum exercício no treino"
              : `${exercises.length} exercício${exercises.length !== 1 ? "s" : ""}`}
          </h2>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <Plus className="h-4 w-4" />
            Adicionar exercício
          </button>
        </div>

        <ul className="space-y-2">
          {displayExercises.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-border bg-background-elevated/30 py-8 text-center text-sm text-text-muted">
              Adicione exercícios pelo botão acima ou ao editar um exercício em Exercícios.
            </li>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={displayExercises.map((e) => e.workoutExerciseId)}
                strategy={verticalListSortingStrategy}
              >
                {displayExercises.map((item) => (
                  <SortableExerciseRow
                    key={item.workoutExerciseId}
                    item={item}
                    onNavigate={() => navigate(`/exercicios/${item.exerciseId}`)}
                    onRemove={() => handleRemove(item.exerciseId)}
                    removingId={removingId}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </ul>
      </section>

      <AddExerciseToWorkoutModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        workoutId={workoutId!}
        workoutName={workout.name}
        exerciseIdsInWorkout={exercises.map((e) => e.exerciseId)}
        onSuccess={refresh}
      />
    </>
  );
}
