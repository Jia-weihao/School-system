'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import  api  from "../app/tools/api";

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

// 检查当前环境，如果是开发环境且前端也运行在3000端口，则使用完整URL
// 在实际部署时，可以使用相对路径或环境变量配置

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
        
        // Verify token and get user data
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log("用户验证成功:", data.user.email);
          setUser(data.user);
        } else {
          // Token is invalid or expired
          console.log("令牌无效或已过期");
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('认证状态检查错误:', err);
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
      
      // 添加延迟，确保请求能够完成
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      console.log("登录响应状态:", response.status);
      
      // 处理非200响应
      if (!response.ok) {
        const errorText = await response.text();
        console.error("登录失败:", response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.message || '登录失败');
        } catch (e) {
          setError(`登录失败 (${response.status})`);
        }
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log("登录响应数据:", data);

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // 确保响应包含预期的用户数据结构
      if (data.user && data.user.role) {
        console.log("登录成功，设置用户状态:", data.user);
        setUser(data.user);
      } else {
        console.error("用户数据格式不正确:", data);
        setError('用户数据格式不正确');
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError('登录失败，服务器可能不可用，请稍后重试');
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