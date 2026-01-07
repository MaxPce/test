import { Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { FormatsPage } from "@/pages/FormatsPage";
import { FormatDetailPage } from "@/pages/FormatDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/formats" element={<FormatsPage />} />
      <Route path="/formats/:id" element={<FormatDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
