'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { useAuth } from '../context/AuthContext';

interface ButtonPermissionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  resource: string;
  action: string;
  hideIfNoPermission?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Button component with permission check
const ButtonPermission = ({
  resource,
  action,
  hideIfNoPermission = false,
  children,
  className = '',
  ...props
}: ButtonPermissionProps) => {
  const { hasPermission } = useAuth();

  // Check if user has the required permission
  const allowed = hasPermission(resource, action);

  // If user has no permission and hideIfNoPermission is true, don't render
  if (!allowed && hideIfNoPermission) {
    return null;
  }

  // Render disabled button if not allowed
  return (
    <button
      {...props}
      disabled={!allowed || props.disabled}
      className={`${className} ${!allowed ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!allowed ? '您没有权限执行此操作' : props.title}
    >
      {children}
    </button>
  );
};

export default ButtonPermission;