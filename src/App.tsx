import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { ExerciseDetailPage } from "./pages/exercise-detail/ExerciseDetailPage";
import { ExercisesPage } from "./pages/exercises/ExercisesPage";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/login/LoginPage";
import { PeriodizationsPage } from "./pages/periodizations/PeriodizationsPage";
import { ConfigPage } from "./pages/settings/ConfigPage";
import { CheckoutPage } from "./pages/checkout/CheckoutPage";
import { CheckoutSuccessPage } from "./pages/checkout/CheckoutSuccessPage";
import { CheckoutCancelPage } from "./pages/checkout/CheckoutCancelPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/treinos" element={<Navigate to="/exercicios" replace />} />
            <Route path="/treinos/:workoutId" element={<Navigate to="/exercicios" replace />} />
            <Route path="/exercicios" element={<ExercisesPage />} />
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
