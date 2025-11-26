import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Package,
  DollarSign,
  Shield,
  TrendingUp,
  AlertTriangle,
  LayoutDashboard,
  CheckCircle,
  List,
  BarChart3,
  Settings,
  Home,
  UserCheck,
} from 'lucide-react';
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

type PendingKycUser = {
  id: string;
  name: string;
  email: string;
  kycDocumentUrl: string | null;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'unverified' | null;
  updatedAt: string;
};

const SuperAdminDashboard = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<
    'overview' | 'vendor-approvals' | 'kyc-approvals' | 'all-users' | 'all-products' | 'all-vendors' | 'disputes' | 'analytics' | 'settings'
  >('overview');
  const [pendingKycUsers, setPendingKycUsers] = useState<PendingKycUser[]>([]);
  const [loadingKyc, setLoadingKyc] = useState(false);
  const [kycActionLoading, setKycActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'superadmin' && token) {
      void fetchPendingVendors();
      void fetchPendingKycUsers();
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

  const fetchPendingKycUsers = async () => {
    if (!token) return;
    setLoadingKyc(true);
    try {
      const data = await apiRequest<{ success: boolean; users: PendingKycUser[] }>('/users/kyc/pending', {
        token,
      });
      setPendingKycUsers(data.users);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load KYC submissions');
    } finally {
      setLoadingKyc(false);
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

  const handleKycReview = async (userId: string, status: 'approved' | 'rejected') => {
    if (!token) return;
    setKycActionLoading(`${userId}-${status}`);
    try {
      const data = await apiRequest<{ success: boolean; message: string }>(`/users/kyc/${userId}`, {
        method: 'PATCH',
        body: { status },
        token,
      });
      toast.success(data.message);
      setPendingKycUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update KYC status');
    } finally {
      setKycActionLoading(null);
    }
  };

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, change: '+89 this month' },
    { label: 'Pending KYC', value: pendingKycUsers.length.toString(), icon: Shield, change: `${pendingKycUsers.length} awaiting approval` },
    { label: 'Pending Vendors', value: pendingVendors.length.toString(), icon: UserCheck, change: `${pendingVendors.length} awaiting review` },
    { label: 'Total Products', value: '2,345', icon: Package, change: 'Across all vendors' },
    { label: 'Platform Revenue', value: '₹12.5L', icon: DollarSign, change: '+18% growth' },
  ];

  const recentDisputes = [
    { id: 'd1', user: 'John Doe', vendor: 'Tech Rentals Pro', product: 'MacBook Pro', status: 'open' },
    { id: 'd2', user: 'Jane Smith', vendor: 'Camera World', product: 'Sony A7 IV', status: 'resolved' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <>
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

          {/* Pending KYC */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending KYC Approvals</CardTitle>
                  <CardDescription>Verify customer identities</CardDescription>
                </div>
                <Badge variant="secondary">{pendingKycUsers.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loadingKyc ? (
                <p className="text-sm text-muted-foreground">Loading pending KYC submissions...</p>
              ) : pendingKycUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending KYC submissions.</p>
              ) : (
                <div className="space-y-3">
                  {pendingKycUsers.map((kycUser) => (
                    <div
                      key={kycUser.id}
                      className="flex flex-col gap-3 border rounded-lg p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <h3 className="font-semibold">{kycUser.name}</h3>
                        <p className="text-sm text-muted-foreground">{kycUser.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted on {new Date(kycUser.updatedAt).toLocaleDateString()}
                        </p>
                        {kycUser.kycDocumentUrl && (
                          <a
                            href={kycUser.kycDocumentUrl}
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
                          disabled={kycActionLoading === `${kycUser.id}-rejected`}
                          onClick={() => handleKycReview(kycUser.id, 'rejected')}
                        >
                          {kycActionLoading === `${kycUser.id}-rejected` ? 'Rejecting...' : 'Reject'}
                        </Button>
                        <Button
                          size="sm"
                          disabled={kycActionLoading === `${kycUser.id}-approved`}
                          onClick={() => handleKycReview(kycUser.id, 'approved')}
                        >
                          {kycActionLoading === `${kycUser.id}-approved` ? 'Approving...' : 'Approve'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          </>
        );

      case 'vendor-approvals':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Vendor Approvals</h1>
              <p className="text-muted-foreground">Review and verify new vendor applications</p>
            </div>

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
          </>
        );

      case 'all-users':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">All Users</h1>
              <p className="text-muted-foreground">Manage all platform users</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">User list will be implemented here</p>
              </CardContent>
            </Card>
          </>
        );

      case 'kyc-approvals':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">KYC Approvals</h1>
              <p className="text-muted-foreground">Review and approve customer KYC submissions</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pending KYC Submissions</CardTitle>
                    <CardDescription>Verify customer identities before rentals</CardDescription>
                  </div>
                  <Badge variant="secondary">{pendingKycUsers.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loadingKyc ? (
                  <p className="text-sm text-muted-foreground">Loading pending KYC submissions...</p>
                ) : pendingKycUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending KYC submissions.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingKycUsers.map((kycUser) => (
                      <div
                        key={kycUser.id}
                        className="flex flex-col gap-3 border rounded-lg p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h3 className="font-semibold">{kycUser.name}</h3>
                          <p className="text-sm text-muted-foreground">{kycUser.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted on {new Date(kycUser.updatedAt).toLocaleDateString()}
                          </p>
                          {kycUser.kycDocumentUrl && (
                            <a
                              href={kycUser.kycDocumentUrl}
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
                            disabled={kycActionLoading === `${kycUser.id}-rejected`}
                            onClick={() => handleKycReview(kycUser.id, 'rejected')}
                          >
                            {kycActionLoading === `${kycUser.id}-rejected` ? 'Rejecting...' : 'Reject'}
                          </Button>
                          <Button
                            size="sm"
                            disabled={kycActionLoading === `${kycUser.id}-approved`}
                            onClick={() => handleKycReview(kycUser.id, 'approved')}
                          >
                            {kycActionLoading === `${kycUser.id}-approved` ? 'Approving...' : 'Approve'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        );

          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">All Users</h1>
              <p className="text-muted-foreground">Manage all platform users</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">User list will be implemented here</p>
              </CardContent>
            </Card>
          </>
        );

      case 'all-products':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">All Products</h1>
              <p className="text-muted-foreground">View and manage all products across the platform</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>All products listed by vendors</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Product list will be implemented here</p>
              </CardContent>
            </Card>
          </>
        );

      case 'all-vendors':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">All Vendors</h1>
              <p className="text-muted-foreground">Manage all vendor accounts</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Management</CardTitle>
                <CardDescription>View and manage all vendor accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Vendor list will be implemented here</p>
              </CardContent>
            </Card>
          </>
        );

      case 'disputes':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Disputes</h1>
              <p className="text-muted-foreground">Handle escalated issues and disputes</p>
            </div>

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
                      <Badge variant={dispute.status === 'open' ? 'default' : 'secondary'}>
                        {dispute.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        );

      case 'analytics':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
              <p className="text-muted-foreground">Key metrics and insights</p>
            </div>

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
          </>
        );

      case 'settings':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">Platform configuration and preferences</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Settings form will be implemented here</p>
              </CardContent>
            </Card>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Super Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView('overview')}
                    isActive={activeView === 'overview'}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView('vendor-approvals')}
                    isActive={activeView === 'vendor-approvals'}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Vendor Approvals</span>
                    {pendingVendors.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {pendingVendors.length}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView('kyc-approvals')}
                    isActive={activeView === 'kyc-approvals'}
                  >
                    <Shield className="h-4 w-4" />
                    <span>KYC Approvals</span>
                    {pendingKycUsers.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {pendingKycUsers.length}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView('all-users')}
                    isActive={activeView === 'all-users'}
                  >
                    <Users className="h-4 w-4" />
                    <span>All Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView('all-vendors')}
                    isActive={activeView === 'all-vendors'}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>All Vendors</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView('all-products')}
                    isActive={activeView === 'all-products'}
                  >
                    <Package className="h-4 w-4" />
                    <span>All Products</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView('disputes')}
                    isActive={activeView === 'disputes'}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Disputes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Reports</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView('analytics')}
                    isActive={activeView === 'analytics'}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView('settings')}
                    isActive={activeView === 'settings'}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate('/')}>
                    <Home className="h-4 w-4" />
                    <span>Back to Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 bg-muted/30">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SuperAdminDashboard;
