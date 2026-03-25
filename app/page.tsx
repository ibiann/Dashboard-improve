import { UnifiedDashboard } from "@/components/unified-dashboard";
import { RequireAuth } from "@/components/auth/require-auth";

export default function Home() {
  return (
    <RequireAuth>
      <UnifiedDashboard />
    </RequireAuth>
  );
}
