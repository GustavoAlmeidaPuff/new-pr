import { Search } from "lucide-react";
import { ChangeEvent } from "react";

type WorkoutSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function WorkoutSearchInput({ value, onChange }: WorkoutSearchInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
      <input
        value={value}
        onChange={handleChange}
        placeholder="Buscar exercício..."
        className="w-full rounded-full border border-border bg-background-elevated py-3 pl-12 pr-4 text-sm text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        type="search"
      />
    </div>
  );
}

