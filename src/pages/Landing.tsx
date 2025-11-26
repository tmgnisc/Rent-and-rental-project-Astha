import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Laptop, Shirt, Home, Dumbbell, Shield, Clock, DollarSign, Sparkles } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import { setProducts, setLoading, Product } from '@/store/slices/productsSlice';
import ProductCard from '@/components/ProductCard';
import { RootState } from '@/store/store';
import Footer from '@/components/Footer';

const Landing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state: RootState) => state.products);

  const loadFeaturedProducts = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const query = new URLSearchParams({ status: 'available', limit: '12' }).toString();
      const data = await apiRequest<{ success: boolean; products: Product[] }>(
        `/public/products?${query}`
      );
      dispatch(setProducts(data.products));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load featured products');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (products.length === 0) {
      loadFeaturedProducts();
    }
  }, [loadFeaturedProducts, products.length]);

  const featuredProducts = products.filter(p => p.status === 'available').slice(0, 4);

  const categories = [
    { name: 'Electronics', icon: Laptop, color: 'from-blue-500 to-cyan-500', path: '/products/electronics' },
    { name: 'Fashion', icon: Shirt, color: 'from-pink-500 to-rose-500', path: '/products/fashion' },
    { name: 'Appliances', icon: Home, color: 'from-green-500 to-emerald-500', path: '/products/appliances' },
    { name: 'Sports', icon: Dumbbell, color: 'from-orange-500 to-amber-500', path: '/products/sports' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Products',
      description: 'All products are quality-checked and verified by our team',
    },
    {
      icon: Clock,
      title: 'Flexible Rentals',
      description: 'Rent for a day, week, or month - your choice',
    },
    {
      icon: DollarSign,
      title: 'Best Prices',
      description: 'Competitive pricing with transparent deposit terms',
    },
    {
      icon: Sparkles,
      title: 'Easy Returns',
      description: 'Hassle-free return process with quick refunds',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-20 md:py-32 overflow-hidden"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Rent Premium Products,
              <br />
              <span className="text-accent">Not Own Them</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Access the latest electronics, fashion, appliances, and sports gear without the commitment of buying. 
              Flexible rentals, verified products, refundable deposits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outlineWhite" 
                size="lg"
                onClick={() => navigate('/products')}
                className="text-lg"
              >
                Browse Products
              </Button>
              <Button 
                variant="accent" 
                size="lg"
                onClick={() => navigate('/signup')}
                className="text-lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Explore Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.name}
                  className="group cursor-pointer border-0 overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                  onClick={() => navigate(category.path)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Products</h2>
            <Button variant="outline" onClick={() => navigate('/products')}>
              View All
            </Button>
          </div>
          {loading ? (
            <div className="text-center text-muted-foreground py-10">
              Loading featured products...
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No featured products available yet. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Rent&Return?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Renting?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of smart renters who choose access over ownership
          </p>
          <Button 
            variant="accent" 
            size="lg"
            onClick={() => navigate('/signup')}
            className="text-lg"
          >
            Create Your Account
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
