import { useEffect, useState } from 'react';
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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { products } = useSelector((state: RootState) => state.products);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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
    // In a real app, this would navigate to KYC/payment flow
    toast.success('Rental process will be implemented soon!');
  };

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
                      ₹{product.rentalPricePerDay}
                    </span>
                    <span className="text-lg text-muted-foreground">/day</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    + ₹{product.refundableDeposit} refundable deposit
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
      <Footer />
    </div>
  );
};

export default ProductDetail;
