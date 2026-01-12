import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Laptop, Shirt, Home, Dumbbell, Shield, Clock, DollarSign, Sparkles, Star, Users, TrendingUp, Package } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import { setProducts, setLoading, Product } from '@/store/slices/productsSlice';
import ProductCard from '@/components/ProductCard';
import { RootState } from '@/store/store';
import Footer from '@/components/Footer';
import Autoplay from 'embla-carousel-autoplay';

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
    { name: 'Electronics', icon: Laptop, color: 'from-blue-500 to-cyan-500', path: '/products' },
    { name: 'Fashion', icon: Shirt, color: 'from-pink-500 to-rose-500', path: '/products' },
    { name: 'Appliances', icon: Home, color: 'from-green-500 to-emerald-500', path: '/products' },
    { name: 'Sports', icon: Dumbbell, color: 'from-orange-500 to-amber-500', path: '/products' },
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


  const autoplayPlugin = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
    })
  );

  const heroImages = [
    {
      url: 'https://plus.unsplash.com/premium_photo-1661755100242-618b5a580db9?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Rent Premium Products',
      subtitle: 'Not Own Them',
      description: 'Access the latest electronics, fashion, appliances, and sports gear without the commitment of buying.'
    },
    {
      url: 'https://images.unsplash.com/photo-1618347191821-51285853505f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Flexible Rentals',
      subtitle: 'Your Way',
      description: 'Rent for a day, week, or month - your choice. Verified products with refundable deposits.'
    },
    {
      url: 'https://plus.unsplash.com/premium_photo-1682090260563-191f8160ca48?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Quality Guaranteed',
      subtitle: 'Every Time',
      description: 'All products are quality-checked and verified by our team for your peace of mind.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[autoplayPlugin.current]}
          className="w-full"
        >
          <CarouselContent>
            {heroImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[600px] md:h-[700px] w-full">
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url('${image.url}')`,
                    }}
                  >
                    {/* Dark Overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/50" />
                  </div>
                  
                  {/* Content */}
                  <div className="container mx-auto px-4 relative z-10 h-full flex items-center">
                    <div className="max-w-3xl mx-auto text-center">
                      <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
                        {image.title}
                        <br />
                        <span className="text-accent">{image.subtitle}</span>
                      </h1>
                      <p className="text-lg md:text-xl text-white/95 mb-8 max-w-2xl mx-auto drop-shadow-md">
                        {image.description}
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
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/30 text-white border-white/30" />
          <CarouselNext className="right-4 bg-white/20 hover:bg-white/30 text-white border-white/30" />
        </Carousel>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">10K+</div>
              <div className="text-sm md:text-base opacity-90">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">5K+</div>
              <div className="text-sm md:text-base opacity-90">Products Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">50K+</div>
              <div className="text-sm md:text-base opacity-90">Successful Rentals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">4.8★</div>
              <div className="text-sm md:text-base opacity-90">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Explore Categories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover a wide range of products across different categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.name}
                  className="group cursor-pointer border-2 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-primary"
                  onClick={() => navigate(category.path)}
                >
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked premium items just for you</p>
            </div>
            <Button variant="outline" size="lg" onClick={() => navigate('/products')} className="mt-4 md:mt-0">
              View All Products
            </Button>
          </div>
          {loading ? (
            <div className="text-center text-muted-foreground py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4">Loading featured products...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No featured products available yet.</p>
              <p className="text-sm">Check back soon!</p>
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Why Choose Rent&Return?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of product access with our innovative rental platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl group"
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 group-hover:bg-primary transition-colors flex items-center justify-center group-hover:scale-110 transform duration-300">
                      <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Tech Enthusiast',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
                rating: 5,
                text: 'Renting electronics here has been a game-changer! I can try the latest gadgets without breaking the bank.',
              },
              {
                name: 'Michael Chen',
                role: 'Fashion Designer',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
                rating: 5,
                text: 'The fashion collection is amazing. I rent designer pieces for events and always get compliments!',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Home Owner',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
                rating: 5,
                text: 'Perfect for trying appliances before buying. The process is smooth and customer service is excellent.',
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-2 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-24 bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground relative overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-primary/90" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Start Renting?
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-3xl mx-auto">
            Join thousands of smart renters who choose access over ownership. 
            Start your journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="default" 
              size="lg"
              onClick={() => navigate('/signup')}
              className="text-lg bg-white text-primary hover:bg-white/90 px-8 py-6"
            >
              Create Your Account
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/products')}
              className="text-lg border-white text-white hover:bg-white hover:text-primary px-8 py-6"
            >
              Browse Products
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>10,000+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>50,000+ Rentals Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-current" />
              <span>4.8/5 Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
