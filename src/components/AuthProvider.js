import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  setSession,
} from "@/lib/store/auth-client";
import { api } from "@/lib/store/client";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
  setAuth: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(() => {
    const t = getStoredToken();
    const u = getStoredUser();
    setToken(t);
    setUser(u);
  }, []);

  const refresh = useCallback(async () => {
    hydrate();
    const t = getStoredToken();
    if (!t) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.me();
      if (data.user) {
        setUser(data.user);
        setSession(t, data.user);
      } else {
        clearSession();
        setUser(null);
        setToken(null);
      }
    } catch {
      clearSession();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [hydrate]);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setToken(null);
  }, []);

  const setAuth = useCallback((nextToken, nextUser) => {
    setSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    hydrate();
    refresh();
    const onAuth = () => hydrate();
    window.addEventListener("ol-auth-change", onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener("ol-auth-change", onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, [hydrate, refresh]);

  const value = useMemo(
    () => ({ user, token, loading, refresh, logout, setAuth }),
    [user, token, loading, refresh, logout, setAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
