import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Shield, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { Product } from '@/store/slices/productsSlice';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import Footer from '@/components/Footer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Elements } from '@stripe/react-stripe-js';
import { publishableKey, stripePromise } from '@/lib/stripe';
import RentalPaymentForm from '@/components/rent/RentalPaymentForm';

type RentalFormState = {
  startDate: string;
  days: number;
  deliveryAddress: string;
  contactPhone: string;
};

type RentalApiResponse = {
  success: boolean;
  rental: {
    id: string;
    status: string;
  };
  clientSecret: string;
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);
  const { products } = useSelector((state: RootState) => state.products);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [rentalId, setRentalId] = useState<string | null>(null);
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [rentForm, setRentForm] = useState<RentalFormState>({
    startDate: '',
    days: 3,
    deliveryAddress: '',
    contactPhone: '',
  });

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const resetRentalFlow = () => {
    setClientSecret(null);
    setRentalId(null);
    setRentForm({
      startDate: '',
      days: 3,
      deliveryAddress: '',
      contactPhone: '',
    });
    setCreatingIntent(false);
  };

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const existingProduct = products.find((p) => p.id === id);
    if (existingProduct) {
      setProduct(existingProduct);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await apiRequest<{ success: boolean; product: Product }>(`/public/products/${id}`);
        setProduct(data.product);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, products]);

useEffect(() => {
  if (rentModalOpen && !rentForm.startDate) {
    setRentForm((prev) => ({ ...prev, startDate: today }));
  }
}, [rentModalOpen, rentForm.startDate, today]);

  const handleRentNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to rent products');
      navigate('/login');
      return;
    }
    if (!user || user.kycStatus !== 'approved') {
      toast.error('Please complete your KYC verification to rent products');
      navigate('/dashboard/user');
      return;
    }
    setRentModalOpen(true);
  };

  const handleRentDialogChange = (open: boolean) => {
    setRentModalOpen(open);
    if (!open) {
      resetRentalFlow();
    }
  };

  const handleCreateRental = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;
    if (!token) {
      toast.error('Authentication expired. Please login again.');
      navigate('/login');
      return;
    }

    setCreatingIntent(true);
    try {
      const payload = {
        productId: product.id,
        startDate: rentForm.startDate || today,
        days: rentForm.days,
        deliveryAddress: rentForm.deliveryAddress,
        contactPhone: rentForm.contactPhone,
      };

      const response = await apiRequest<RentalApiResponse>('/rentals', {
        method: 'POST',
        token,
        body: payload,
      });

      setRentalId(response.rental.id);
      setClientSecret(response.clientSecret);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start rental');
    } finally {
      setCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!rentalId || !token) return;
    try {
      await apiRequest(`/rentals/${rentalId}/confirm`, {
        method: 'POST',
        token,
      });
      toast.success('Rental confirmed! Check your dashboard for details.');
      setProduct((prev) => (prev ? { ...prev, status: 'rented' } : prev));
      handleRentDialogChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to confirm rental');
    }
  };

  const stripeReady = Boolean(publishableKey);

  const rentalSummary = useMemo(() => {
    if (!product) {
      return { rentalCost: 0, total: 0, rentalDays: rentForm.days };
    }

    const rentalDays = rentForm.days > 0 ? rentForm.days : 1;
    const rentalCost = Number(product.rentalPricePerDay) * rentalDays;
    const total = rentalCost + Number(product.refundableDeposit || 0);

    return { rentalCost, total, rentalDays };
  }, [product, rentForm.days]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product not found</h2>
            <Button onClick={() => navigate('/products')}>Back to Products</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success text-success-foreground';
      case 'rented':
        return 'bg-warning text-warning-foreground';
      case 'maintenance':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-3 capitalize">
                  {product.category}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{product.vendor.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium">{product.vendor.rating}</span>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <Separator />

              {/* Pricing Card */}
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-primary">
                      NPR {product.rentalPricePerDay}
                    </span>
                    <span className="text-lg text-muted-foreground">/day</span>
                  </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      + NPR {product.refundableDeposit} refundable deposit
                    </p>
                  
                  <Button 
                    size="lg" 
                    className="w-full"
                    disabled={product.status !== 'available'}
                    onClick={handleRentNow}
                  >
                    {product.status === 'available' ? 'Rent Now' : 'Not Available'}
                  </Button>
                </CardContent>
              </Card>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs font-medium">Verified</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs font-medium">Flexible</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs font-medium">Best Price</p>
                  </CardContent>
                </Card>
              </div>

              {/* Specifications */}
              {product.specifications && (
                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={rentModalOpen} onOpenChange={handleRentDialogChange}>
        <DialogContent className="sm:max-w-lg">
          {!clientSecret ? (
            <>
              <DialogHeader>
                <DialogTitle>Reserve {product.name}</DialogTitle>
                <DialogDescription>
                  Provide a few rental details to calculate your total before payment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRental} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      min={today}
                      value={rentForm.startDate}
                      onChange={(event) =>
                        setRentForm((prev) => ({ ...prev, startDate: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days">Rental Days</Label>
                    <Input
                      id="days"
                      type="number"
                      min={1}
                      max={60}
                      value={rentForm.days}
                      onChange={(event) =>
                        setRentForm((prev) => ({
                          ...prev,
                          days: Number(event.target.value) || 1,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery / Pickup Address</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    value={rentForm.deliveryAddress}
                    onChange={(event) =>
                      setRentForm((prev) => ({ ...prev, deliveryAddress: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Number</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={rentForm.contactPhone}
                    onChange={(event) =>
                      setRentForm((prev) => ({ ...prev, contactPhone: event.target.value }))
                    }
                    required
                  />
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        NPR {product.rentalPricePerDay} × {rentalSummary.rentalDays} days
                      </span>
                      <span className="font-semibold">NPR {rentalSummary.rentalCost}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Refundable deposit</span>
                      <span>NPR {product.refundableDeposit}</span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total due now</span>
                      <span className="text-xl font-bold text-primary">NPR {rentalSummary.total}</span>
                    </div>
                  </CardContent>
                </Card>

                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={creatingIntent}>
                    {creatingIntent ? 'Preparing payment...' : 'Continue to Payment'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : !stripeReady ? (
            <>
              <DialogHeader>
                <DialogTitle>Stripe Not Configured</DialogTitle>
                <DialogDescription>
                  Add `VITE_STRIPE_PUBLISHABLE_KEY` to your frontend `.env` file and restart the dev
                  server to enable card payments.
                </DialogDescription>
              </DialogHeader>
              <Button onClick={() => setClientSecret(null)}>Go Back</Button>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Complete Payment</DialogTitle>
                <DialogDescription>
                  Securely pay with your card to confirm this rental. Your deposit is fully refundable
                  after the product is returned.
                </DialogDescription>
              </DialogHeader>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: { theme: 'stripe' },
                }}
              >
                <RentalPaymentForm onSuccess={handlePaymentSuccess} />
              </Elements>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProductDetail;
