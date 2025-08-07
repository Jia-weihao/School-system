'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';

interface PermissionGuardProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Component that renders content only if user has the required permission
const PermissionGuard = ({
  resource,
  action,
  children,
  fallback = null
}: PermissionGuardProps) => {
  const { hasPermission } = useAuth();
  
  // Check if user has the required permission
  const allowed = hasPermission(resource, action);
  
  // Render children if allowed, otherwise render fallback
  return allowed ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard; 