'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from "../app/tools/api";

// Define types
export interface Permission {
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL - 确保API地址正确
const API_URL = api;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 清除错误信息
  const clearError = () => setError(null);

  // Check if the user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        console.log("检查认证状态");
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log("未找到认证令牌");
          setLoading(false);
          return;
        }
        
        console.log("尝试验证令牌");
        
        // Verify token and get user data using axios
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        });

        if (response.status === 200) {
          console.log("用户验证成功:", response.data.user.email);
          setUser(response.data.user);
        }
      } catch (err: any) {
        console.error('认证状态检查错误:', err);
        // Token is invalid or expired
        console.log("令牌无效或已过期");
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("开始登录请求:", email);
      console.log("API URL:", `${API_URL}/api/auth/login`);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000,
        withCredentials: true
      });

      console.log("登录响应状态:", response.status);
      console.log("登录响应数据:", response.data);

      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      // 确保响应包含预期的用户数据结构
      if (response.data.user && response.data.user.role) {
        console.log("登录成功，设置用户状态:", response.data.user);
        setUser(response.data.user);
      } else {
        console.error("用户数据格式不正确:", response.data);
        setError('用户数据格式不正确');
        localStorage.removeItem('token');
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError(`无法连接到服务器，请确保后端服务正在运行 (${API_URL})`);
      } else if (err.response) {
        // 服务器响应了错误状态码
        const errorMessage = err.response.data?.message || `登录失败 (${err.response.status})`;
        setError(errorMessage);
      } else if (err.request) {
        // 请求已发出但没有收到响应
        setError('登录失败，服务器可能不可用，请稍后重试');
      } else {
        // 其他错误
        setError('登录失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log("用户登出");
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check if user has permission
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;

    // Principal (校长) has all permissions
    if (user.role.name === 'principal') return true;

    // Check user permissions
    return user.permissions.some(
      permission => permission.resource === resource && 
        (permission.action === action || permission.action === 'manage')
    );
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasPermission,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};