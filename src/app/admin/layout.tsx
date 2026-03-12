'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('admin_token');
    // Redirect to login
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin/dashboard" className="text-xl font-bold">
                LogoGenius Admin
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link 
                  href="/admin/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/admin/create-order"
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Order
                </Link>
              </nav>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
