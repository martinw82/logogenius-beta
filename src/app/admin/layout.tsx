'use client';

import Link from 'next/link';
import { LayoutDashboard, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white" 
            onClick={() => {
              localStorage.removeItem('admin_token');
              window.location.href = '/admin/login';
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
