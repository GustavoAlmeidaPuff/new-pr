import { Dumbbell, Home, LineChart, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Treinos", to: "/treinos", icon: Dumbbell },
  { label: "Períodos", to: "/periodizacoes", icon: LineChart },
  { label: "Config", to: "/config", icon: Settings },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-4 left-0 right-0 z-20 mx-auto w-full max-w-md rounded-3xl border border-border bg-background-elevated/95 px-2 py-2 backdrop-blur-md md:bottom-8 md:max-w-2xl lg:static lg:mx-auto lg:mb-6 lg:max-w-3xl lg:border lg:bg-background-card/90 lg:px-6 lg:py-3">
      <ul className="flex items-center justify-between gap-2">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-text-muted hover:text-primary/80",
                ].join(" ")
              }
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

