import { useAppSelector } from "../store/hooks";

export default function useAuth() {
  const { user, token, isLoading } = useAppSelector((state) => state.auth);
  return { user, token, isLoading, isAuthenticated: !!token };
}
