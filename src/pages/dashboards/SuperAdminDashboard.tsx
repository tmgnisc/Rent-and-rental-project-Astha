import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Package, DollarSign, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';

type PendingVendor = {
  id: string;
  name: string;
  email: string;
  vendorDocumentUrl: string | null;
  verificationStatus: 'pending' | 'approved' | 'rejected' | null;
  createdAt: string;
};

const SuperAdminDashboard = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'superadmin' && token) {
      void fetchPendingVendors();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, token]);

  const fetchPendingVendors = async () => {
    if (!token) return;
    setLoadingVendors(true);
    try {
      const data = await apiRequest<{ success: boolean; vendors: PendingVendor[] }>('/vendors/pending', {
        token,
      });
      setPendingVendors(data.vendors);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load vendors');
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleVerify = async (vendorId: string, status: 'approved' | 'rejected') => {
    if (!token) return;
    setActionLoading(`${vendorId}-${status}`);
    try {
      const data = await apiRequest<{ success: boolean; message: string }>(`/vendors/${vendorId}/verify`, {
        method: 'PATCH',
        body: { status },
        token,
      });
      toast.success(data.message);
      setPendingVendors((prev) => prev.filter((vendor) => vendor.id !== vendorId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update vendor');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, change: '+89 this month' },
    { label: 'Pending Vendors', value: pendingVendors.length.toString(), icon: Shield, change: `${pendingVendors.length} awaiting review` },
    { label: 'Total Products', value: '2,345', icon: Package, change: 'Across all vendors' },
    { label: 'Platform Revenue', value: '₹12.5L', icon: DollarSign, change: '+18% growth' },
  ];

  const recentDisputes = [
    { id: 'd1', user: 'John Doe', vendor: 'Tech Rentals Pro', product: 'MacBook Pro', status: 'open' },
    { id: 'd2', user: 'Jane Smith', vendor: 'Camera World', product: 'Sony A7 IV', status: 'resolved' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Pending Vendors */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Vendor Approvals</CardTitle>
                  <CardDescription>Review and verify new vendors</CardDescription>
                </div>
                <Badge variant="secondary">{pendingVendors.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loadingVendors ? (
                <p className="text-sm text-muted-foreground">Loading pending vendors...</p>
              ) : pendingVendors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending vendor applications.</p>
              ) : (
                <div className="space-y-3">
                  {pendingVendors.map((vendor) => (
                    <div 
                      key={vendor.id}
                      className="flex flex-col gap-3 border rounded-lg p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <h3 className="font-semibold">{vendor.name}</h3>
                        <p className="text-sm text-muted-foreground">{vendor.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied on {new Date(vendor.createdAt).toLocaleDateString()}
                        </p>
                        {vendor.vendorDocumentUrl && (
                          <a
                            href={vendor.vendorDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            View Document
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === `${vendor.id}-rejected`}
                          onClick={() => handleVerify(vendor.id, 'rejected')}
                        >
                          {actionLoading === `${vendor.id}-rejected` ? 'Rejecting...' : 'Reject'}
                        </Button>
                        <Button
                          size="sm"
                          disabled={actionLoading === `${vendor.id}-approved`}
                          onClick={() => handleVerify(vendor.id, 'approved')}
                        >
                          {actionLoading === `${vendor.id}-approved` ? 'Approving...' : 'Approve'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disputes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Disputes</CardTitle>
                  <CardDescription>Handle escalated issues</CardDescription>
                </div>
                <Button variant="outline">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDisputes.map((dispute) => (
                  <div 
                    key={dispute.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <p className="font-medium">{dispute.product}</p>
                        <p className="text-sm text-muted-foreground">
                          {dispute.user} vs {dispute.vendor}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={dispute.status === 'open' ? 'default' : 'secondary'}
                    >
                      {dispute.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Analytics
            </CardTitle>
            <CardDescription>Key metrics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-2xl font-bold text-primary">98.5%</p>
                <p className="text-sm text-muted-foreground">Platform Uptime</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">4.8</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">89%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">5.2k</p>
                <p className="text-sm text-muted-foreground">Total Rentals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
