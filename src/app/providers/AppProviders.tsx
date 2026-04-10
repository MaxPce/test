import { useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./queryClient";
import { useAuthStore } from "@/app/store/useAuthStore";
import { operatorPermissionsApi } from "@/features/admin/api/operator-permissions.api";

interface AppProvidersProps {
  children: ReactNode;
}

interface OperatorPermissionsLoaderProps {
  children: ReactNode;
}

function OperatorPermissionsLoader({
  children,
}: OperatorPermissionsLoaderProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const operatorPermissions = useAuthStore((s) => s.operatorPermissions);
  const setOperatorPermissions = useAuthStore((s) => s.setOperatorPermissions);

  useEffect(() => {
    if (isAuthenticated && user?.role === "operator" && !operatorPermissions) {
      operatorPermissionsApi
        .getMyPermissions()
        .then((perms) => setOperatorPermissions(perms))
        .catch(() => setOperatorPermissions(null));
    }
  }, [
    isAuthenticated,
    user?.role,
    operatorPermissions,
    setOperatorPermissions,
  ]);

  return <>{children}</>;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <OperatorPermissionsLoader>{children}</OperatorPermissionsLoader>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}