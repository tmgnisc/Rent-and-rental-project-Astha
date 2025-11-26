import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Package, Clock, CheckCircle, AlertCircle, History, Upload, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { setCredentials } from '@/store/slices/authSlice';
import type { User } from '@/store/slices/authSlice';
import { Label } from '@/components/ui/label';

type RentalProduct = {
  id: string;
  name: string | null;
  image: string | null;
  category: string | null;
  vendorName: string | null;
};

type UserRental = {
  id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string | null;
  dueDate: string | null;
  totalAmount: number;
  createdAt: string;
  handedOverAt: string | null;
  returnedAt: string | null;
  overdueDays: number;
  isOverdue: boolean;
  outstandingFine: number;
  dailyFine: number;
  returnRequestStatus: 'none' | 'pending' | 'approved' | 'rejected';
  returnRequestNote: string | null;
  returnRequestImage: string | null;
  product: RentalProduct | null;
};

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
  const [rentals, setRentals] = useState<UserRental[]>([]);
  const [rentalsLoading, setRentalsLoading] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<UserRental | null>(null);
  const [returnNote, setReturnNote] = useState('');
  const [returnFile, setReturnFile] = useState<File | null>(null);
  const [returnPreview, setReturnPreview] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const returnObjectUrlRef = useRef<string | null>(null);

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

  const fetchUserRentals = useCallback(async () => {
    if (!token) return;
    setRentalsLoading(true);
    try {
      const data = await apiRequest<{ success: boolean; rentals: UserRental[] }>('/rentals/me', {
        token,
      });
      setRentals(data.rentals || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch rentals');
    } finally {
      setRentalsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchKycStatus();
    fetchUserRentals();
  }, [fetchKycStatus, fetchUserRentals]);

  useEffect(() => {
    if (user) {
      setKycStatus(user.kycStatus || 'unverified');
      setKycDocumentUrl(user.kycDocumentUrl || null);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      if (returnObjectUrlRef.current) {
        URL.revokeObjectURL(returnObjectUrlRef.current);
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
      const data = await apiRequest<{
        success: boolean;
        message: string;
        kyc: { status: string; documentUrl: string | null };
        user: User;
      }>(
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

  const openReturnModal = (rental: UserRental) => {
    setSelectedRental(rental);
    setReturnNote('');
    setReturnFile(null);
    if (returnObjectUrlRef.current) {
      URL.revokeObjectURL(returnObjectUrlRef.current);
      returnObjectUrlRef.current = null;
    }
    setReturnPreview('');
    setReturnModalOpen(true);
  };

  const closeReturnModal = () => {
    setReturnModalOpen(false);
    setSelectedRental(null);
    setReturnNote('');
    setReturnFile(null);
    if (returnObjectUrlRef.current) {
      URL.revokeObjectURL(returnObjectUrlRef.current);
      returnObjectUrlRef.current = null;
    }
    setReturnPreview('');
  };

  const handleReturnFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (returnObjectUrlRef.current) {
      URL.revokeObjectURL(returnObjectUrlRef.current);
      returnObjectUrlRef.current = null;
    }
    const previewUrl = URL.createObjectURL(file);
    returnObjectUrlRef.current = previewUrl;
    setReturnFile(file);
    setReturnPreview(previewUrl);
  };

  const handleReturnRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRental || !token) return;
    if (!returnNote.trim()) {
      toast.error('Please describe the product condition.');
      return;
    }
    if (!returnFile) {
      toast.error('Please upload a photo of the product.');
      return;
    }

    setReturnSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('note', returnNote.trim());
      payload.append('photo', returnFile);
      await apiRequest(`/rentals/${selectedRental.id}/return-request`, {
        method: 'POST',
        token,
        body: payload,
      });
      toast.success('Return request submitted');
      closeReturnModal();
      fetchUserRentals();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit return request');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const rentalSummary = useMemo(() => {
    const active = rentals.filter((rental) => rental.status === 'active').length;
    const pending = rentals.filter((rental) => rental.status === 'pending').length;
    const totalSpent = rentals
      .filter((rental) => ['completed', 'active'].includes(rental.status))
      .reduce((sum, rental) => sum + Number(rental.totalAmount || 0), 0);

    return {
      active,
      pending,
      totalSpent,
    };
  }, [rentals]);

  const stats = [
    {
      label: 'KYC Status',
      value: kycStatus ? kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1) : 'Unverified',
      icon: ShieldCheck,
      color: isKycApproved ? 'text-success' : 'text-warning',
    },
    { label: 'Active Rentals', value: rentalSummary.active.toString(), icon: Package, color: 'text-primary' },
    { label: 'Pending Requests', value: rentalSummary.pending.toString(), icon: Clock, color: 'text-warning' },
    {
      label: 'Total Spent',
      value: `NPR ${rentalSummary.totalSpent.toFixed(2)}`,
      icon: History,
      color: 'text-accent',
    },
  ];

  return (
    <>
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
                {kycStatus === 'rejected' && (
                  <p className="text-sm text-destructive">
                    Previous submission was rejected. Please upload a new document.
                  </p>
                )}
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
            {rentalsLoading ? (
              <p className="text-sm text-muted-foreground text-center py-6">Loading your rentals...</p>
            ) : rentals.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">
                Rental history will appear here once you book your first item.
              </div>
            ) : (
              <div className="space-y-4">
                {rentals.map((rental) => (
                  <div
                    key={rental.id}
                    className="flex flex-col gap-4 border rounded-lg p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {rental.product?.image && (
                        <img
                          src={rental.product.image}
                          alt={rental.product.name || 'Product image'}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="space-y-1">
                        <p className="font-semibold">{rental.product?.name || 'Product'}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {rental.product?.category || 'category'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rental window: {new Date(rental.startDate).toLocaleDateString()}
                          {rental.dueDate && ` → ${new Date(rental.dueDate).toLocaleDateString()}`}
                        </p>
                        {rental.handedOverAt && (
                          <p className="text-xs text-muted-foreground">
                            Handed over on {new Date(rental.handedOverAt).toLocaleDateString()}
                          </p>
                        )}
                        {rental.returnedAt && (
                          <p className="text-xs text-muted-foreground">
                            Returned on {new Date(rental.returnedAt).toLocaleDateString()}
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
                      {rental.isOverdue && (
                        <p className="text-xs text-destructive font-semibold">
                          Overdue by {rental.overdueDays} day(s). Fine NPR{' '}
                          {Number(rental.outstandingFine || 0).toFixed(2)}
                        </p>
                      )}
                      {rental.returnRequestStatus === 'pending' && (
                        <p className="text-xs text-warning font-semibold">
                          Return request pending vendor approval
                        </p>
                      )}
                      {rental.returnRequestStatus === 'approved' && (
                        <p className="text-xs text-success font-semibold">Return approved</p>
                      )}
                      {rental.returnRequestStatus === 'rejected' && (
                        <p className="text-xs text-destructive font-semibold">Return request rejected</p>
                      )}
                      {rental.status === 'active' && rental.returnRequestStatus !== 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => openReturnModal(rental)}>
                          Request Return
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      <Dialog
        open={returnModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeReturnModal();
          } else {
            setReturnModalOpen(true);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
            <DialogDescription>
              Share the product condition and upload a clear photo so the vendor can review your request quickly.
            </DialogDescription>
          </DialogHeader>
          {selectedRental && (
            <form onSubmit={handleReturnRequestSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Product</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedRental.product?.name || 'Product'} • Due on{' '}
                  {selectedRental.dueDate
                    ? new Date(selectedRental.dueDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="return-note">Condition & description *</Label>
                <Textarea
                  id="return-note"
                  rows={3}
                  value={returnNote}
                  onChange={(event) => setReturnNote(event.target.value)}
                  placeholder="Mention any accessories, scratches, or packaging details."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="return-photo">Product photo *</Label>
                <Input
                  id="return-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleReturnFileChange}
                />
                {returnPreview && (
                  <img
                    src={returnPreview}
                    alt="Return preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeReturnModal} disabled={returnSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={returnSubmitting}>
                  {returnSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserDashboard;
