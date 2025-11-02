import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, CheckCircle, AlertCircle, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Mock rental data
  const mockRentals = [
    {
      id: 'r1',
      productName: 'MacBook Pro 16" M3',
      status: 'active',
      startDate: '2025-01-15',
      endDate: '2025-01-30',
      dailyRate: 50,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    },
    {
      id: 'r2',
      productName: 'Sony A7 IV Camera',
      status: 'pending',
      startDate: '2025-02-01',
      endDate: '2025-02-07',
      dailyRate: 40,
      image: 'https://images.unsplash.com/photo-1606980496917-90f44d3d1a34?w=400&q=80',
    },
  ];

  const stats = [
    { label: 'Active Rentals', value: '1', icon: Package, color: 'text-primary' },
    { label: 'Pending', value: '1', icon: Clock, color: 'text-warning' },
    { label: 'Completed', value: '5', icon: CheckCircle, color: 'text-success' },
    { label: 'Total Spent', value: '₹12,450', icon: History, color: 'text-accent' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Manage your rentals and explore new products</p>
        </div>

        {/* KYC Alert */}
        {!user?.isVerified && (
          <Card className="mb-6 border-warning bg-warning/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Complete your KYC verification</p>
                <p className="text-sm text-muted-foreground">
                  Upload your documents to start renting products
                </p>
              </div>
              <Button size="sm" variant="outline">
                Verify Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Rentals */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Rentals</CardTitle>
                <CardDescription>Track your current and upcoming rentals</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRentals.map((rental) => (
                <div 
                  key={rental.id}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={rental.image}
                    alt={rental.productName}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{rental.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {rental.startDate} to {rental.endDate}
                        </p>
                      </div>
                      {getStatusBadge(rental.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        <span className="font-semibold text-primary">₹{rental.dailyRate}</span>/day
                      </p>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Package className="h-5 w-5" />
                <span className="text-sm">Browse Products</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <History className="h-5 w-5" />
                <span className="text-sm">Rental History</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Request Return</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Support</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
