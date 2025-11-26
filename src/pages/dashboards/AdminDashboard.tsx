import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, Users, TrendingUp, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = [
    { label: 'Total Products', value: '24', icon: Package, change: '+3 this month' },
    { label: 'Active Rentals', value: '18', icon: Users, change: '+5 this week' },
    { label: 'Revenue', value: 'NPR 45,200', icon: DollarSign, change: '+12% this month' },
    { label: 'Growth', value: '23%', icon: TrendingUp, change: 'vs last month' },
  ];

  const mockProducts = [
    { id: '1', name: 'MacBook Pro 16"', category: 'Electronics', status: 'available', rentals: 12 },
    { id: '2', name: 'Sony A7 IV Camera', category: 'Electronics', status: 'rented', rentals: 8 },
    { id: '3', name: 'Designer Suit', category: 'Fashion', status: 'available', rentals: 15 },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
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
                  <p className="text-xs text-success">{stat.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Products Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Products</CardTitle>
                <CardDescription>Manage your rental inventory</CardDescription>
              </div>
              <Button variant="outline">View All</Button>
            </div>
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
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Rental Requests</CardTitle>
            <CardDescription>Review and approve pending requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">New rental request #{i}</p>
                    <p className="text-sm text-muted-foreground">MacBook Pro - 7 days</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Decline</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
