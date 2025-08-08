'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../../components/LoginForm';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 增加调试日志
    console.log("登录页状态:", { user, loading });
    
    // 如果已登录，立即跳转到dashboard
    if (user && !loading) {
      console.log("登录页检测到用户已登录，立即重定向到dashboard");
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // 避免闪烁，如果正在检查用户状态，显示加载中
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p>正在加载...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 如果用户已登录，显示一个过渡信息（实际上会被上面的useEffect重定向）
  if (user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <p>已登录，正在跳转到首页...</p>
      </div>
    );
  }

  return <LoginForm />;
} 