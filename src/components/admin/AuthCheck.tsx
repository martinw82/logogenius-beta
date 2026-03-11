'use client';

import { useEffect, useState } from 'react';

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      try {
        const response = await fetch('/api/admin/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      } catch {
        window.location.href = '/admin/login';
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
