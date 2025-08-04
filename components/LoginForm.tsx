'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from '../app/dashboard/dashboard.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login, error, loading, user, clearError } = useAuth();
  const router = useRouter();
  
  // 在组件挂载时清除之前的错误
  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // 监听用户状态变化，登录成功后跳转
  useEffect(() => {
    if (user) {
      console.log("用户已登录，准备跳转到dashboard");
      console.log("用户信息:", user);
      
      // 添加短暂延迟确保状态更新完成
      setTimeout(() => {
        // 使用replace而不是push来避免浏览器历史堆栈问题
        router.replace('/dashboard');
      }, 100);
    }
  }, [user, router]);

  // 监听错误状态
  useEffect(() => {
    if (error) {
      setLoginError(error);
      setIsLoading(false);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || loading) return;
    
    setLoginError('');
    setIsLoading(true);
    
    try {
      // 预处理邮箱，去除空格
      const trimmedEmail = email.trim();
      console.log("尝试登录:", trimmedEmail);
      
      // 调用登录函数
      await login(trimmedEmail, password);
      
      // 检查登录后的状态
      console.log("登录函数执行完成，当前用户状态:", user);
    } catch (err) {
      console.error("登录提交出错:", err);
      setLoginError('登录失败，请检查您的邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.backgroundPattern}></div>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.title}>欢迎回来</h1>
          <p className={styles.subtitle}>请登录您的账户</p>
        </div>
        
        {(loginError) && (
          <div className={styles.errorMessage}>
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>邮箱地址</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="请输入您的邮箱"
              required
              disabled={isLoading || loading}
              autoComplete="email"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="请输入您的密码"
              required
              disabled={isLoading || loading}
              autoComplete="current-password"
            />
          </div>
          
          <div className={styles.helpText}>
            <div>
              {/* Test account information removed */}
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`${styles.loginButton} ${(isLoading || loading) ? styles.loading : ''}`}
            disabled={isLoading || loading}
          >
            {(isLoading || loading) ? (
              <span className={styles.spinner}></span>
            ) : (
              '登录'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 