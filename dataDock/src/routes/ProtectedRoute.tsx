import { Navigate } from "react-router-dom"; //commenting as its causing build erro on Vercel deployment

export default function ProtectedRoute({ children }: any) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

// export default function ProtectedRoute({
//   children,
// }: any) {
//   return children;
// }
