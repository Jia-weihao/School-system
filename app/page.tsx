'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // 如果用户已登录，直接跳转到dashboard
    // 如果未登录，跳转到登录页面
    // 使用replace而不是push来避免历史记录
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [router, user, loading]);

  // 返回空白页面，不显示任何内容
  return null;
}
