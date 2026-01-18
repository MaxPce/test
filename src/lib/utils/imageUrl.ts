const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Convierte una ruta relativa del backend a URL completa
 */
export function getImageUrl(relativePath?: string | null): string | undefined {
  if (!relativePath) return undefined;

  // Si ya es una URL completa, devolverla tal cual
  if (
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://")
  ) {
    return relativePath;
  }

  // Si comienza con /uploads, es del backend
  if (relativePath.startsWith("/uploads/")) {
    // Quitar el /api del baseURL si existe
    const baseUrl = API_BASE_URL.replace("/api", "");
    return `${baseUrl}${relativePath}`;
  }

  return relativePath;
}
