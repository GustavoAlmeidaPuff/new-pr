import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { ExerciseDetailPage } from "./pages/exercise-detail/ExerciseDetailPage";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/login/LoginPage";
import { PeriodizationsPage } from "./pages/periodizations/PeriodizationsPage";
import { ConfigPage } from "./pages/settings/ConfigPage";
import { WorkoutDetailPage } from "./pages/workouts/WorkoutDetailPage";
import { WorkoutsPage } from "./pages/workouts/WorkoutsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/treinos" element={<WorkoutsPage />} />
            <Route path="/treinos/:workoutId" element={<WorkoutDetailPage />} />
            <Route path="/exercicios/:exerciseId" element={<ExerciseDetailPage />} />
            <Route path="/periodizacoes" element={<PeriodizationsPage />} />
            <Route path="/config" element={<ConfigPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
