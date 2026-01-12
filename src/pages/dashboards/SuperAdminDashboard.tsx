import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/store/slices/productsSlice';

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

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  kycStatus?: 'unverified' | 'pending' | 'approved' | 'rejected' | null;
  kycDocumentUrl?: string | null;
  createdAt: string;
};

type ReturnRequest = {
  id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  returnRequestStatus: 'pending' | 'approved' | 'rejected';
  returnRequestNote: string | null;
  returnRequestImage: string | null;
  returnRejectionReason: string | null;
  returnRejectionNote: string | null;
  returnRequestedAt: string | null;
  updatedAt: string;
  product?: {
    name: string | null;
    image: string | null;
    category: string | null;
    vendorName: string | null;
  } | null;
  customer?: {
    name: string | null;
    email: string | null;
  } | null;
};

type PlatformStats = {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalRentals: number;
  activeRentals: number;
  pendingRentals: number;
  completedRentals: number;
  totalRevenue: number;
  pendingReturns: number;
  disputes: number;
};

const SuperAdminDashboard = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<
    | 'overview'
    | 'vendor-approvals'
    | 'kyc-approvals'
    | 'all-users'
    | 'all-products'
    | 'all-vendors'
    | 'return-requests'
    | 'disputes'
    | 'analytics'
    | 'settings'
  >('overview');
  const [pendingKycUsers, setPendingKycUsers] = useState<PendingKycUser[]>([]);
  const [loadingKyc, setLoadingKyc] = useState(false);
  const [kycActionLoading, setKycActionLoading] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [disputeReturns, setDisputeReturns] = useState<ReturnRequest[]>([]);
  const [loadingDisputes, setLoadingDisputes] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [platformStatsLoading, setPlatformStatsLoading] = useState(false);
  const [analyticsDisputes, setAnalyticsDisputes] = useState<ReturnRequest[]>([]);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const customerUsers = useMemo(
    () => allUsers.filter((u) => u.role === 'user'),
    [allUsers]
  );
  const vendorUsers = useMemo(
    () => allUsers.filter((u) => u.role === 'vendor'),
    [allUsers]
  );
  const overviewDisputes = useMemo(() => disputeReturns.slice(0, 3), [disputeReturns]);

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

const fetchAllUsers = async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const data = await apiRequest<{ success: boolean; users: AdminUser[] }>('/users/all', {
        token,
      });
      setAllUsers(data.users);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

const fetchReturnRequests = useCallback(async () => {
  if (!token) return;
  setLoadingReturns(true);
  try {
    const data = await apiRequest<{ success: boolean; returns: ReturnRequest[] }>('/rentals/admin/returns', {
      token,
    });
    setReturnRequests(data.returns);
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to load return requests');
  } finally {
    setLoadingReturns(false);
  }
}, [token]);

const fetchDisputeReturns = useCallback(async () => {
  if (!token) return;
  setLoadingDisputes(true);
  try {
    const data = await apiRequest<{ success: boolean; disputes: ReturnRequest[] }>('/rentals/admin/disputes', {
      token,
    });
    setDisputeReturns(data.disputes);
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to load disputes');
  } finally {
    setLoadingDisputes(false);
  }
}, [token]);

const fetchAllProducts = async () => {
    if (!token) return;
    setLoadingProducts(true);
    try {
      const data = await apiRequest<{ success: boolean; products: Product[] }>('/admin/products', {
        token,
      });
      setAllProducts(data.products);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchPlatformAnalytics = useCallback(async () => {
    if (!token) return;
    setPlatformStatsLoading(true);
    try {
      const data = await apiRequest<{ success: boolean; stats: PlatformStats; recentDisputes: ReturnRequest[] }>(
        '/admin/analytics',
        { token }
      );
      setPlatformStats(data.stats);
      setAnalyticsDisputes(data.recentDisputes);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setPlatformStatsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === 'superadmin' && token) {
      void fetchPendingVendors();
      void fetchPendingKycUsers();
      void fetchAllUsers();
      void fetchAllProducts();
      void fetchReturnRequests();
      void fetchPlatformAnalytics();
      void fetchDisputeReturns();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, token, fetchReturnRequests, fetchDisputeReturns, fetchPlatformAnalytics]);

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

  const handlePasswordChangeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordSubmitting(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'PATCH',
        token,
        body: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const pendingReturnCount = returnRequests.filter((req) => req.returnRequestStatus === 'pending').length;

  const stats = [
    {
      label: 'Total Users',
      value: platformStats ? platformStats.totalUsers.toString() : allUsers.length.toString(),
      icon: Users,
      change: '',
    },
    {
      label: 'Total Vendors',
      value: platformStats ? platformStats.totalVendors.toString() : vendorUsers.length.toString(),
      icon: UserCheck,
      change: 'Vendors onboarded',
    },
    {
      label: 'Total Products',
      value: platformStats ? platformStats.totalProducts.toString() : allProducts.length.toString(),
      icon: Package,
      change: 'Listed across categories',
    },
    {
      label: 'Active Rentals',
      value: platformStats ? platformStats.activeRentals.toString() : '0',
      icon: TrendingUp,
      change: 'Currently rented',
    },
    {
      label: 'Pending KYC',
      value: pendingKycUsers.length.toString(),
      icon: Shield,
      change: `${pendingKycUsers.length} awaiting approval`,
    },
    {
      label: 'Pending Returns',
      value: platformStats ? platformStats.pendingReturns.toString() : pendingReturnCount.toString(),
      icon: RotateCcw,
      change: 'Awaiting vendor review',
    },
    {
      label: 'Platform Revenue',
      value: platformStats ? `NPR ${platformStats.totalRevenue.toFixed(2)}` : 'NPR 0',
      icon: DollarSign,
      change: 'Active + completed',
    },
    {
      label: 'Active Disputes',
      value: platformStats ? platformStats.disputes.toString() : disputeReturns.length.toString(),
      icon: AlertTriangle,
      change: 'Vendor rejections',
    },
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
                <Button variant="outline" onClick={() => setActiveView('disputes')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {overviewDisputes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No disputes in the last few days.</p>
              ) : (
              <div className="space-y-3">
                  {overviewDisputes.map((dispute) => (
                  <div 
                    key={dispute.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                          <p className="font-medium">{dispute.product?.name || 'Product'}</p>
                        <p className="text-sm text-muted-foreground">
                            {dispute.customer?.name || dispute.customer?.email || 'Customer'} vs{' '}
                            {dispute.product?.vendorName || 'Vendor'}
                          </p>
                          {dispute.returnRejectionReason && (
                            <p className="text-xs text-muted-foreground">
                              Reason: {dispute.returnRejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="destructive" className="capitalize">
                        {dispute.returnRequestStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
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

      case 'all-users':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">All Customers</h1>
              <p className="text-muted-foreground">Manage all customer accounts</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>View and manage all customer accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                ) : customerUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No customers found.</p>
                ) : (
                  <div className="space-y-3">
                    {customerUsers.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex flex-col gap-2 border rounded-lg p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h3 className="font-semibold">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(customer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={customer.isVerified ? 'default' : 'secondary'}>
                            {customer.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                          <Badge variant="outline">
                            KYC: {customer.kycStatus ? customer.kycStatus : 'unverified'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {loadingProducts ? (
                  <p className="text-sm text-muted-foreground">Loading products...</p>
                ) : allProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
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
                {loadingUsers ? (
                  <p className="text-sm text-muted-foreground">Loading vendors...</p>
                ) : vendorUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No vendors found.</p>
                ) : (
                  <div className="space-y-3">
                    {vendorUsers.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="flex flex-col gap-2 border rounded-lg p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h3 className="font-semibold">{vendor.name}</h3>
                          <p className="text-sm text-muted-foreground">{vendor.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(vendor.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={vendor.isVerified ? 'default' : 'secondary'}>
                            {vendor.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                          <Badge variant="outline">
                            KYC: {vendor.kycStatus ? vendor.kycStatus : 'unverified'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        );

      case 'return-requests':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Return Requests</h1>
              <p className="text-muted-foreground">
                Track customer return submissions, vendor decisions, and supporting evidence.
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Return Requests</CardTitle>
                    <CardDescription>Monitor pending and resolved returns</CardDescription>
                  </div>
                  <Badge variant="secondary">{returnRequests.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loadingReturns ? (
                  <p className="text-sm text-muted-foreground">Loading return requests...</p>
                ) : returnRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No return activity yet.</p>
                ) : (
                  <div className="space-y-3">
                    {returnRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col gap-3 border rounded-lg p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold">{request.product?.name || 'Product'}</p>
                          <p className="text-xs text-muted-foreground">
                            Customer: {request.customer?.name || request.customer?.email || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Vendor: {request.product?.vendorName || 'N/A'}
                          </p>
                          {request.returnRequestNote && (
                            <p className="text-xs text-muted-foreground">
                              Note: {request.returnRequestNote}
                            </p>
                          )}
                          {request.returnRequestImage && (
                            <a
                              href={request.returnRequestImage}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary underline"
                            >
                              View submitted photo
                            </a>
                          )}
                          {request.returnRejectionReason && (
                            <p className="text-xs text-destructive">
                              Rejected: {request.returnRejectionReason}
                              {request.returnRejectionNote && ` — ${request.returnRejectionNote}`}
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <Badge
                            variant={
                              request.returnRequestStatus === 'approved'
                                ? 'default'
                                : request.returnRequestStatus === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                            className="capitalize"
                          >
                            {request.returnRequestStatus}
                          </Badge>
                          {request.returnRequestedAt && (
                            <p className="text-xs text-muted-foreground">
                              Requested on {new Date(request.returnRequestedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        );

      case 'disputes':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Return Disputes</h1>
              <p className="text-muted-foreground">
                Vendors rejected these return requests. Review the evidence and feedback from both sides.
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vendor Rejections</CardTitle>
                    <CardDescription>Use this log to intervene when required.</CardDescription>
                  </div>
                  <Badge variant="secondary">{disputeReturns.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loadingDisputes ? (
                  <p className="text-sm text-muted-foreground">Loading disputes...</p>
                ) : disputeReturns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No disputes at the moment.</p>
                ) : (
                  <div className="space-y-3">
                    {disputeReturns.map((dispute) => (
                      <div
                        key={dispute.id}
                        className="flex flex-col gap-3 border rounded-lg p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold">{dispute.product?.name || 'Product'}</p>
                          <p className="text-xs text-muted-foreground">
                            Customer: {dispute.customer?.name || dispute.customer?.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Vendor: {dispute.product?.vendorName || 'N/A'}
                          </p>
                          {dispute.returnRequestNote && (
                            <p className="text-xs text-muted-foreground">
                              Customer note: {dispute.returnRequestNote}
                            </p>
                          )}
                          <p className="text-xs text-destructive">
                            Vendor rejection: {dispute.returnRejectionReason || 'No reason provided'}
                          </p>
                          {dispute.returnRejectionNote && (
                            <p className="text-xs text-destructive">
                              Vendor note: {dispute.returnRejectionNote}
                            </p>
                          )}
                          {dispute.returnRequestImage && (
                            <a
                              href={dispute.returnRequestImage}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary underline"
                            >
                              View customer photo
                            </a>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant="destructive" className="capitalize">
                            Rejected
                          </Badge>
                          {dispute.returnRequestedAt && (
                            <p className="text-xs text-muted-foreground">
                              Requested on {new Date(dispute.returnRequestedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {platformStatsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading analytics...</p>
                ) : platformStats ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-2xl font-bold text-primary">{platformStats.totalRentals}</p>
                        <p className="text-sm text-muted-foreground">Total Rentals</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{platformStats.completedRentals}</p>
                        <p className="text-sm text-muted-foreground">Completed Rentals</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{platformStats.pendingRentals}</p>
                        <p className="text-sm text-muted-foreground">Pending Rentals</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          NPR {platformStats.totalRevenue.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Recent Disputes</h3>
                        <Button variant="ghost" size="sm" onClick={() => setActiveView('disputes')}>
                          View All
                        </Button>
                      </div>
                      {analyticsDisputes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No disputes recorded in the latest analytics window.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {analyticsDisputes.map((dispute) => (
                            <div
                              key={dispute.id}
                              className="flex items-start justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{dispute.product?.name || 'Product'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {dispute.customer?.name || dispute.customer?.email || 'Customer'} vs{' '}
                                  {dispute.product?.vendorName || 'Vendor'}
                                </p>
                              </div>
                              <Badge variant="destructive">Rejected</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Analytics data unavailable.</p>
                )}
              </CardContent>
            </Card>
          </>
        );

      case 'settings':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your superadmin account preferences</p>
            </div>

            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your login credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                        }
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                        }
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                        }
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={passwordSubmitting}>
                      {passwordSubmitting ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
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
                    onClick={() => setActiveView('return-requests')}
                    isActive={activeView === 'return-requests'}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Return Requests</span>
                    {pendingReturnCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {pendingReturnCount}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView('disputes')}
                    isActive={activeView === 'disputes'}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Disputes</span>
                    {disputeReturns.length > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {disputeReturns.length}
                      </Badge>
                    )}
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
