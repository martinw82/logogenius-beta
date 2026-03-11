'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface Order {
  id: number;
  tier: string;
  status: string;
  customerEmail: string;
  businessName: string;
  createdAt: string;
  updatedAt: string;
  hasAssets: boolean;
}

interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  generating: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  completed: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-800',
};

const tierColors: Record<string, string> = {
  basic: 'bg-blue-50 text-blue-900',
  pro: 'bg-purple-50 text-purple-900',
  premium: 'bg-amber-50 text-amber-900',
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('all');
  const [tier, setTier] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: '25',
          sortBy,
          sortDir,
          ...(status !== 'all' && { status }),
          ...(tier !== 'all' && { tier }),
          ...(search && { search }),
        });

        const response = await fetch(`/api/admin/orders?${params}`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch orders');

        const data = await response.json();
        setOrders(data.orders);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timeout = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 300);

    return () => clearTimeout(timeout);
  }, [status, tier, search, page, sortBy, sortDir]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {pagination ? `Total: ${pagination.total} orders` : 'Loading...'}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by Email</label>
              <Input
                placeholder="customer@example.com"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="generating">Generating</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tier</label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="tier">Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-600">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No orders found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      ID
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('tier')}
                    >
                      Tier
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell className="text-sm text-gray-600">{order.customerEmail}</TableCell>
                      <TableCell>{order.businessName || '-'}</TableCell>
                      <TableCell>
                        <Badge className={tierColors[order.tier] || 'bg-gray-100'}>
                          {order.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status] || 'bg-gray-100'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="border-t p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPage(pagination.page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => setPage(pagination.page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
