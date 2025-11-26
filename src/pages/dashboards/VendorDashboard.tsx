import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { Product } from '@/store/slices/productsSlice';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import ProductForm from '@/components/ProductForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Package,
  Plus,
  List,
  Edit,
  Trash2,
  BarChart3,
  Settings,
  Home,
  LayoutDashboard,
  Clock,
} from 'lucide-react';

type VendorRental = {
  id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string | null;
  dueDate: string | null;
  totalAmount: number;
  createdAt: string;
  product: {
    id: string;
    name: string | null;
    category: string | null;
    image: string | null;
  } | null;
  customer?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  handedOverAt: string | null;
  returnedAt: string | null;
  overdueDays: number;
  isOverdue: boolean;
  outstandingFine: number;
  dailyFine: number;
  returnRequestStatus: 'none' | 'pending' | 'approved' | 'rejected';
  returnRequestNote: string | null;
  returnRequestImage: string | null;
};

type VendorAnalyticsSummary = {
  totalRentals: number;
  activeRentals: number;
  pendingRentals: number;
  completedRentals: number;
  cancelledRentals: number;
  totalRevenue: number;
  uniqueCustomers: number;
  outstandingFines: number;
  overdueRentals: number;
};

const VendorDashboard = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'overview' | 'products' | 'add-product' | 'analytics' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [rentals, setRentals] = useState<VendorRental[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<VendorAnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoadingProducts(true);
    try {
      const data = await apiRequest<{ success: boolean; products: Product[] }>('/products', {
        token,
      });
      setProducts(data.products);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  }, [token]);

  const handleCreateProduct = async (formData: FormData) => {
    if (!token) return;
    setFormSubmitting(true);
    try {
      await apiRequest<{ success: boolean; message: string; product: Product }>('/products', {
        method: 'POST',
        body: formData,
        token,
      });
      toast.success('Product created successfully!');
      setActiveView('products');
      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateProduct = async (formData: FormData) => {
    if (!token || !editingProduct) return;
    setFormSubmitting(true);
    try {
      await apiRequest<{ success: boolean; message: string; product: Product }>(
        `/products/${editingProduct.id}`,
        {
          method: 'PUT',
          body: formData,
          token,
        }
      );
      toast.success('Product updated successfully!');
      setActiveView('products');
      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update product');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!token || !deleteProductId) return;
    setDeleteLoading(true);
    try {
      await apiRequest<{ success: boolean; message: string }>(`/products/${deleteProductId}`, {
        method: 'DELETE',
        token,
      });
      toast.success('Product deleted successfully!');
      setDeleteProductId(null);
      await fetchProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setActiveView('add-product');
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setActiveView('add-product');
  };

  const handleHandover = async (rentalId: string) => {
    if (!token) return;
    setActionLoading(`handover-${rentalId}`);
    try {
      await apiRequest<{ success: boolean }>(`/rentals/${rentalId}/handover`, {
        method: 'PATCH',
        token,
      });
      toast.success('Rental marked as handed over');
      await fetchAnalytics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update rental');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (rentalId: string) => {
    if (!token) return;
    setActionLoading(`return-${rentalId}`);
    try {
      await apiRequest<{ success: boolean }>(`/rentals/${rentalId}/return`, {
        method: 'PATCH',
        token,
      });
      toast.success('Rental marked as returned');
      await fetchAnalytics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark as returned');
    } finally {
      setActionLoading(null);
    }
  };

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const data = await apiRequest<{
        success: boolean;
        summary: VendorAnalyticsSummary;
        rentals: VendorRental[];
      }>('/rentals/vendor/analytics', {
        token,
      });
      setAnalyticsSummary(data.summary);
      setRentals(data.rentals);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeView === 'products' || activeView === 'overview') {
      fetchProducts();
    }
  }, [activeView, fetchProducts]);

  useEffect(() => {
    if (activeView === 'overview' || activeView === 'analytics') {
      fetchAnalytics();
    }
  }, [activeView, fetchAnalytics]);

  const stats = [
    {
      label: 'Total Products',
      value: products.length.toString(),
      icon: Package,
      change: `${products.filter((p) => p.status === 'available').length} available`,
    },
    {
      label: 'Active Rentals',
      value: analyticsSummary ? analyticsSummary.activeRentals.toString() : '0',
      icon: BarChart3,
      change: 'Currently rented',
    },
    {
      label: 'Pending Requests',
      value: analyticsSummary ? analyticsSummary.pendingRentals.toString() : '0',
      icon: Clock,
      change: 'Awaiting approval/payment',
    },
    {
      label: 'Revenue',
      value: analyticsSummary ? `NPR ${analyticsSummary.totalRevenue.toFixed(2)}` : 'NPR 0',
      icon: Package,
      change: 'Lifetime earnings',
    },
  ];

  const analyticsRentals = useMemo(() => rentals.slice(0, 6), [rentals]);

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
              <p className="text-muted-foreground">Manage your products and track your rental business</p>
            </div>

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
                      <p className="text-xs text-success">{stat.change}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Your latest products</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : products.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">No products yet</p>
                    <Button onClick={handleAddClick} size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {products.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                        </div>
                        <Badge variant={product.status === 'available' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        );

      case 'products':
        return (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Products</h1>
                <p className="text-muted-foreground">Manage your rental inventory</p>
              </div>
              <Button onClick={handleAddClick} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product List</CardTitle>
                <CardDescription>All your listed products</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <p className="text-sm text-muted-foreground">Loading products...</p>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No products yet</p>
                    <Button onClick={handleAddClick} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                            <p className="text-sm font-medium text-primary mt-1">
                              NPR {product.rentalPricePerDay}/day
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge
                              variant={product.status === 'available' ? 'default' : 'secondary'}
                              className="mt-1"
                            >
                              {product.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              onClick={() => setDeleteProductId(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        );

      case 'add-product':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-muted-foreground">
                {editingProduct ? 'Update product information' : 'List a new product for rent'}
              </p>
            </div>

            <ProductForm
              product={editingProduct}
              onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
              onCancel={() => {
                setEditingProduct(null);
                setActiveView('products');
              }}
              loading={formSubmitting}
            />
          </>
        );

      case 'analytics':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Analytics</h1>
              <p className="text-muted-foreground">Track your business performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Rentals</CardDescription>
                  <CardTitle className="text-3xl">
                    {analyticsSummary ? analyticsSummary.totalRentals : '—'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {analyticsSummary
                    ? `${analyticsSummary.completedRentals} completed • ${analyticsSummary.pendingRentals} pending`
                    : 'No rental data yet'}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Rentals</CardDescription>
                  <CardTitle className="text-3xl">
                    {analyticsSummary ? analyticsSummary.activeRentals : '—'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {analyticsSummary
                    ? `${analyticsSummary.uniqueCustomers} unique customers`
                    : 'Waiting for first rental'}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Revenue</CardDescription>
                  <CardTitle className="text-3xl">
                    {analyticsSummary ? `NPR ${analyticsSummary.totalRevenue.toFixed(2)}` : 'NPR 0.00'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Revenue from confirmed & completed rentals
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Outstanding Fines</CardDescription>
                  <CardTitle className="text-3xl">
                    {analyticsSummary ? `NPR ${analyticsSummary.outstandingFines.toFixed(2)}` : 'NPR 0.00'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {analyticsSummary
                    ? `${analyticsSummary.overdueRentals} overdue rentals`
                    : 'No pending dues'}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Rentals</CardTitle>
                <CardDescription>Latest bookings and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading rental insights...</p>
                ) : analyticsRentals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No rentals yet.</p>
                ) : (
                  <div className="space-y-3">
                    {analyticsRentals.map((rental) => (
                      <div
                        key={rental.id}
                        className="flex flex-col gap-3 border rounded-lg p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start gap-4">
                          {rental.product?.image && (
                            <img
                              src={rental.product.image}
                              alt={rental.product.name || 'Product image'}
                              className="w-14 h-14 rounded-lg object-cover"
                            />
                          )}
                          <div className="space-y-1">
                            <p className="font-semibold">{rental.product?.name || 'Product'}</p>
                            <p className="text-xs text-muted-foreground">
                              Due by{' '}
                              {rental.dueDate
                                ? new Date(rental.dueDate).toLocaleDateString()
                                : 'N/A'}
                            </p>
                            {rental.customer && (
                              <p className="text-xs text-muted-foreground">
                                Customer: {rental.customer.name || rental.customer.email}
                              </p>
                            )}
                            {rental.isOverdue && (
                              <p className="text-xs text-destructive font-semibold">
                                Overdue by {rental.overdueDays} day(s). Fine NPR 
                                {Number(rental.outstandingFine || 0).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge
                            variant={
                              rental.status === 'completed'
                                ? 'default'
                                : rental.status === 'active'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="capitalize"
                          >
                            {rental.status}
                          </Badge>
                          <p className="text-sm font-semibold text-primary">
                            NPR {Number(rental.totalAmount || 0).toFixed(2)}
                          </p>
                          <div className="flex flex-wrap justify-end gap-2">
                            {rental.status === 'active' && !rental.handedOverAt && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleHandover(rental.id)}
                                disabled={actionLoading === `handover-${rental.id}`}
                              >
                                {actionLoading === `handover-${rental.id}` ? 'Updating...' : 'Mark handed'}
                              </Button>
                            )}
                            {rental.status === 'active' && rental.handedOverAt && !rental.returnedAt && (
                              <Button
                                size="sm"
                                onClick={() => handleReturn(rental.id)}
                                disabled={actionLoading === `return-${rental.id}`}
                              >
                                {actionLoading === `return-${rental.id}` ? 'Saving...' : 'Mark returned'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
              <p className="text-muted-foreground">Manage your vendor account settings</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your profile and preferences</CardDescription>
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
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Vendor Portal</span>
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
                    onClick={() => setActiveView('products')}
                    isActive={activeView === 'products'}
                  >
                    <List className="h-4 w-4" />
                    <span>My Products</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleAddClick}
                    isActive={activeView === 'add-product'}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
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

        <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProduct}
                disabled={deleteLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  );
};

export default VendorDashboard;

