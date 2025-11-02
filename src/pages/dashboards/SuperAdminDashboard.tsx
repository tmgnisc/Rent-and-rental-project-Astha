import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Package, DollarSign, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, change: '+89 this month' },
    { label: 'Total Vendors', value: '156', icon: Shield, change: '+12 pending' },
    { label: 'Total Products', value: '2,345', icon: Package, change: 'Across all vendors' },
    { label: 'Platform Revenue', value: '₹12.5L', icon: DollarSign, change: '+18% growth' },
  ];

  const pendingVendors = [
    { id: '1', name: 'Tech Rentals Plus', products: 0, status: 'pending', date: '2025-01-28' },
    { id: '2', name: 'Fashion Hub', products: 0, status: 'pending', date: '2025-01-27' },
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
              <div className="space-y-3">
                {pendingVendors.map((vendor) => (
                  <div 
                    key={vendor.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{vendor.name}</h3>
                      <p className="text-sm text-muted-foreground">Applied on {vendor.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Reject</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
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
