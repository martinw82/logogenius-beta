'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  const checkAuth = useCallback(async () => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/verify', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
        }
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      window.location.href = '/admin/login';
    } finally {
      setIsLoading(false);
    }
  }, [isLoginPage]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

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

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">LogoGenius</h1>
        </div>
        <nav className="px-4 space-y-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="w-full justify-start text-white">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/create-order">
            <Button variant="ghost" className="w-full justify-start text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </Link>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="ghost" className="w-full justify-start text-white" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
