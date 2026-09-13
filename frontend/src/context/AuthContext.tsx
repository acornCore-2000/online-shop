import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "./authContext";
import type { User } from "./authContext";
import api from "../api/api";

const fetchCurrentUser = async (): Promise<User> => {
  const response = await api.get("/api/me");

  return response.data.user;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user = null, isLoading, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    retry: false,
  });

  const isAuthenticated = !isError && user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
