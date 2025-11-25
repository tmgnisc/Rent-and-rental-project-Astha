import { useState } from 'react';
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
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'overview' | 'products' | 'add-product' | 'analytics' | 'settings'>('overview');

  const stats = [
    { label: 'Total Products', value: '24', icon: Package, change: '+3 this month' },
    { label: 'Active Rentals', value: '18', icon: BarChart3, change: '+5 this week' },
    { label: 'Revenue', value: '₹45,200', icon: Package, change: '+12% this month' },
    { label: 'Rating', value: '4.8', icon: BarChart3, change: 'Based on 120 reviews' },
  ];

  const mockProducts = [
    { id: '1', name: 'MacBook Pro 16"', category: 'Electronics', status: 'available', rentals: 12 },
    { id: '2', name: 'Sony A7 IV Camera', category: 'Electronics', status: 'rented', rentals: 8 },
    { id: '3', name: 'Designer Suit', category: 'Fashion', status: 'available', rentals: 15 },
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
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest product updates and rentals</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No recent activity</p>
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
              <Button onClick={() => setActiveView('add-product')} className="gap-2">
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
                <div className="space-y-3">
                  {mockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{product.rentals} rentals</p>
                          <Badge
                            variant={product.status === 'available' ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {product.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        );

      case 'add-product':
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
              <p className="text-muted-foreground">List a new product for rent</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Fill in the details of your product</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Product form will be implemented here</p>
              </CardContent>
            </Card>
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
                    onClick={() => setActiveView('add-product')}
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
      </div>
    </SidebarProvider>
  );
};

export default VendorDashboard;

