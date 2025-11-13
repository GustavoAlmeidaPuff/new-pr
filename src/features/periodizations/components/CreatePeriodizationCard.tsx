import { Plus } from "lucide-react";

type CreatePeriodizationCardProps = {
  onClick?: () => void;
};

export function CreatePeriodizationCard({ onClick }: CreatePeriodizationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-background-card/40 p-6 text-center text-text-muted transition hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Plus className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">Nova periodização</h3>
        <p className="text-xs text-inherit">
          Cadastre um novo ciclo de Base, Shock ou Deload para continuar evoluindo.
        </p>
      </div>
    </button>
  );
}

