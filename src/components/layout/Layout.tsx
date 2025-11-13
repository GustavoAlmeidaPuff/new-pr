import { Outlet } from "react-router-dom";

import { BottomNavigation } from "../navigation/BottomNavigation";

export function Layout() {
  return (
    <div className="relative min-h-screen bg-background text-text">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#10253B_0%,#050B12_55%)] opacity-90" />
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 pb-28 pt-8 md:px-8 md:pb-20">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}

