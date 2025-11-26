import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Clock, CheckCircle, AlertCircle, History, Upload, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { setCredentials } from '@/store/slices/authSlice';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [kycStatus, setKycStatus] = useState(user?.kycStatus || 'unverified');
  const [kycDocumentUrl, setKycDocumentUrl] = useState<string | null>(user?.kycDocumentUrl || null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycUploading, setKycUploading] = useState(false);
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycPreview, setKycPreview] = useState<string>('');
  const objectUrlRef = useRef<string | null>(null);

  const fetchKycStatus = useCallback(async () => {
    if (!token) return;
    setKycLoading(true);
    try {
      const data = await apiRequest<{ success: boolean; kyc: { status: string; documentUrl: string | null } }>(
        '/users/kyc',
        { token }
      );
      setKycStatus(data.kyc.status || 'unverified');
      setKycDocumentUrl(data.kyc.documentUrl || null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch KYC status');
    } finally {
      setKycLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchKycStatus();
  }, [fetchKycStatus]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;
    setKycPreview(previewUrl);
    setKycFile(file);
  };

  const handleKycUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFile) {
      toast.error('Please select a document image');
      return;
    }
    if (!token) return;
    setKycUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', kycFile);
      const data = await apiRequest<{ success: boolean; message: string; kyc: { status: string; documentUrl: string | null }; user: any }>(
        '/users/kyc',
        {
          method: 'POST',
          body: formData,
          token,
        }
      );
      toast.success(data.message);
      setKycStatus(data.kyc.status);
      setKycDocumentUrl(data.kyc.documentUrl || null);
      setKycFile(null);
      setKycPreview('');
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (data.user) {
        dispatch(setCredentials({ user: data.user, token }));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload KYC document');
    } finally {
      setKycUploading(false);
    }
  };

  const navigateToProducts = () => navigate('/products');

  const isKycApproved = kycStatus === 'approved';

  const stats = [
    {
      label: 'KYC Status',
      value: kycStatus ? kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1) : 'Unverified',
      icon: ShieldCheck,
      color: isKycApproved ? 'text-success' : 'text-warning',
    },
    { label: 'Active Rentals', value: '0', icon: Package, color: 'text-primary' },
    { label: 'Pending Requests', value: '0', icon: Clock, color: 'text-warning' },
    { label: 'Total Spent', value: '₹0', icon: History, color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Manage your rentals and explore new products</p>
        </div>

        <Card className="mb-8 border-muted">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>KYC Verification</CardTitle>
                <CardDescription>
                  {isKycApproved
                    ? 'Your identity has been verified. You can rent products without limitations.'
                    : 'Complete your KYC to unlock rentals and ensure a safe marketplace experience.'}
                </CardDescription>
              </div>
              <Badge
                className={
                  isKycApproved
                    ? 'bg-success text-success-foreground'
                    : kycStatus === 'pending'
                      ? 'bg-warning text-warning-foreground'
                      : 'bg-muted text-foreground'
                }
              >
                {kycStatus ? kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1) : 'Unverified'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isKycApproved ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-success" />
                <span>Your KYC document has been approved.</span>
              </div>
            ) : (
              <form onSubmit={handleKycUpload} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a clear photo of a government-issued ID (Aadhaar, Passport, Driver’s License). Supported formats: JPG, PNG. Max size 5MB.
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={kycUploading}
                />
                {(kycPreview || kycDocumentUrl) && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-2">Document Preview</p>
                    <img
                      src={kycPreview || (kycDocumentUrl as string)}
                      alt="KYC document preview"
                      className="w-40 h-40 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={kycUploading || !kycFile} className="gap-2">
                    <Upload className="h-4 w-4" />
                    {kycUploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                  {!kycFile && (
                    <p className="text-xs text-muted-foreground">
                      Select a file to enable upload.
                    </p>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>

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
              <Button variant="outline" onClick={navigateToProducts}>
                Browse Products
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-6">
              Rental history will appear here once you book your first item.
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
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={navigateToProducts}>
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
