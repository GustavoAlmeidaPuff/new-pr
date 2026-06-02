import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { ExerciseDetailPage } from "./pages/exercise-detail/ExerciseDetailPage";
import { ExercisesPage } from "./pages/exercises/ExercisesPage";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/login/LoginPage";
import { PeriodizationsPage } from "./pages/periodizations/PeriodizationsPage";
import { ConfigPage } from "./pages/settings/ConfigPage";
import { AddAccountPage } from "./pages/accounts/AddAccountPage";
import { TreinoDetailPage } from "./pages/treinos/TreinoDetailPage";
import { TreinosPage } from "./pages/treinos/TreinosPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/treinos" element={<TreinosPage />} />
            <Route path="/treinos/:workoutId" element={<TreinoDetailPage />} />
            <Route path="/exercicios" element={<ExercisesPage />} />
            <Route path="/exercicios/:exerciseId" element={<ExerciseDetailPage />} />
            <Route path="/periodizacoes" element={<PeriodizationsPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/contas/adicionar" element={<AddAccountPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
