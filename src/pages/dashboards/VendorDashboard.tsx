import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { Product, ProductCategory } from '@/store/slices/productsSlice';
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
} from 'lucide-react';

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

  useEffect(() => {
    if ((activeView === 'products' || activeView === 'overview') && token) {
      fetchProducts();
    }
  }, [activeView, token]);

  const fetchProducts = async () => {
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
  };

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

  const stats = [
    { label: 'Total Products', value: products.length.toString(), icon: Package, change: `${products.filter(p => p.status === 'available').length} available` },
    { label: 'Active Rentals', value: products.filter(p => p.status === 'rented').length.toString(), icon: BarChart3, change: 'Currently rented' },
    { label: 'Revenue', value: '₹0', icon: Package, change: 'This month' },
    { label: 'Rating', value: '0', icon: BarChart3, change: 'Based on reviews' },
  ];

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
                              ₹{product.rentalPricePerDay}/day
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

            <Card>
              <CardHeader>
                <CardTitle>Business Analytics</CardTitle>
                <CardDescription>Revenue, rentals, and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Analytics charts will be implemented here</p>
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

