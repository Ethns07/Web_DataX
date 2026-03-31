'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { MOCK_USERS } from './data';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthState = {
  user: User | null;
  isLoading: boolean;
};

type AuthAction = 
  | { type: 'INIT'; user: User | null }
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT':
      return { user: action.user, isLoading: false };
    case 'LOGIN':
      return { user: action.user, isLoading: false };
    case 'LOGOUT':
      return { user: null, isLoading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(authReducer, { user: null, isLoading: true });

  useEffect(() => {
    const savedUser = localStorage.getItem('webdatax_user');
    let user = null;
    if (savedUser) {
      try {
        user = JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    dispatch({ type: 'INIT', user });
  }, []);

  const login = async (email: string, role: UserRole) => {
    // In a real app, this would be an API call
    const foundUser = MOCK_USERS.find(u => u.email === email && u.role === role);
    if (foundUser) {
      dispatch({ type: 'LOGIN', user: foundUser });
      localStorage.setItem('webdatax_user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('webdatax_user');
  };

  return (
    <AuthContext.Provider value={{ user: state.user, login, logout, isLoading: state.isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
