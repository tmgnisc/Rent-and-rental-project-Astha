import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, User } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';

type AuthResponse = {
  success: boolean;
  message: string;
  user: User;
  token: string;
};

type VendorSignupResponse = {
  success: boolean;
  message: string;
  vendor: User;
};

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [accountType, setAccountType] = useState<'user' | 'vendor'>('user');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAccountTypeChange = (type: 'user' | 'vendor') => {
    setAccountType(type);
    if (type === 'user') {
      setDocumentFile(null);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (accountType === 'vendor' && !documentFile) {
      toast.error('Please upload your verification document');
      return;
    }

    setLoading(true);

    try {
      if (accountType === 'vendor') {
        const vendorPayload = new FormData();
        vendorPayload.append('name', formData.name);
        vendorPayload.append('email', formData.email);
        vendorPayload.append('password', formData.password);
        if (documentFile) {
          vendorPayload.append('document', documentFile);
        }

        const data = await apiRequest<VendorSignupResponse>('/vendors/register', {
          method: 'POST',
          body: vendorPayload,
        });

        toast.success(data.message || 'Vendor application submitted. Await approval.');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setDocumentFile(null);
        setAccountType('user');
        navigate('/login');
        return;
      }

      const data = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
      });

      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success(data.message || 'Account created successfully!');
      navigate('/dashboard/user');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join Rent&Return as a renter or vendor</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange('user')}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    accountType === 'user'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  Rent Products
                </button>
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange('vendor')}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    accountType === 'vendor'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  List as Vendor
                </button>
              </div>
              {accountType === 'vendor' && (
                <p className="text-xs text-muted-foreground">
                  Upload a government ID or business proof. Super Admin must approve before you can list products.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {accountType === 'vendor' && (
              <div className="space-y-2">
                <Label htmlFor="document">Verification Document</Label>
                <Input
                  id="document"
                  name="document"
                  type="file"
                  accept="image/*"
                  onChange={handleDocumentChange}
                  required={accountType === 'vendor'}
                />
                {documentFile && (
                  <p className="text-xs text-muted-foreground">Selected: {documentFile.name}</p>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? accountType === 'vendor'
                  ? 'Submitting Application...'
                  : 'Creating Account...'
                : accountType === 'vendor'
                  ? 'Submit Vendor Application'
                  : 'Sign Up'}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
