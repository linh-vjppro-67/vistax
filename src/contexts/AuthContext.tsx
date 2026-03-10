import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Role } from '@/data/mock-data';

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  userName: string;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('Admin');

  const userName = role === 'Admin' ? 'Admin User' :
    role === 'Sale' ? 'Nguyen Van A' :
    role === 'PM' ? 'Pham Thi D' :
    role === 'Production' ? 'Hoang Van E' :
    role === 'Finance' ? 'Le Van C' : 'Viewer';

  return (
    <AuthContext.Provider value={{ role, setRole, userName, isAdmin: role === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
