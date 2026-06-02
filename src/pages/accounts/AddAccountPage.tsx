import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { AddAccountPanel } from "../../components/account/AccountAuthForm";

export function AddAccountPage() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col gap-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-text-muted transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="flex flex-1 items-center justify-center">
        <AddAccountPanel />
      </div>
    </section>
  );
}
