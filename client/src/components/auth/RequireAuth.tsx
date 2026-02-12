import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
