import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock login - in real app, this would call an API
    setTimeout(() => {
      // Demo users
      let mockUser;
      if (email === 'user@demo.com') {
        mockUser = { id: '1', email, name: 'Demo User', role: 'user' as const, isVerified: true };
      } else if (email === 'admin@demo.com') {
        mockUser = { id: '2', email, name: 'Demo Admin', role: 'admin' as const, isVerified: true };
      } else if (email === 'superadmin@demo.com') {
        mockUser = { id: '3', email, name: 'Super Admin', role: 'superadmin' as const, isVerified: true };
      } else {
        mockUser = { id: '4', email, name: email.split('@')[0], role: 'user' as const, isVerified: true };
      }

      const mockToken = 'mock-jwt-token-' + Date.now();
      
      dispatch(setCredentials({ user: mockUser, token: mockToken }));
      toast.success(`Welcome back, ${mockUser.name}!`);
      
      // Redirect based on role
      if (mockUser.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (mockUser.role === 'superadmin') {
        navigate('/dashboard/superadmin');
      } else {
        navigate('/dashboard/user');
      }
      
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <Package className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Login to access your Rent&Return account</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
              <p className="font-medium">Demo Accounts:</p>
              <p className="text-muted-foreground">User: user@demo.com</p>
              <p className="text-muted-foreground">Admin: admin@demo.com</p>
              <p className="text-muted-foreground">Super Admin: superadmin@demo.com</p>
              <p className="text-xs text-muted-foreground mt-2">Password: any</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
