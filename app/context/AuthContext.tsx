"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getSession } from "@/lib/session";
import { SessionData, defaultSession } from "@/lib/sessionSetting";

interface AuthContextType {
  user: SessionData;
  setUser: React.Dispatch<React.SetStateAction<SessionData>>;
}

// 초기 상태 정의
const defaultAuthContextValue: AuthContextType = {
  user: defaultSession, 
  setUser: () => {}, 
};

// Context 생성
const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

// Context를 제공할 Provider 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionData>(defaultAuthContextValue.user);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setUser(session);
    };

    fetchSession();
  }, []);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

// Context를 사용하기 위한 Hook
export const useAuth = () => useContext(AuthContext);
