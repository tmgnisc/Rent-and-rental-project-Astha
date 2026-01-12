import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, TrendingUp, Award, Clock, Heart } from 'lucide-react';
import Footer from '@/components/Footer';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'All products are verified and quality-checked to ensure your peace of mind.',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building a community where sharing is caring and sustainability matters.',
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'Leveraging technology to make rentals seamless and accessible to everyone.',
    },
    {
      icon: Award,
      title: 'Quality Service',
      description: 'Committed to providing exceptional service and support to our users.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Customers' },
    { number: '5,000+', label: 'Products Listed' },
    { number: '500+', label: 'Verified Vendors' },
    { number: '99%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-primary">Rent&Return</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              We're revolutionizing the way people access products by making rentals easy, 
              affordable, and sustainable. Join thousands of users who are choosing to rent 
              instead of buy.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section with Image */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                At Rent&Return, we believe in a world where access is more important than ownership. 
                Our mission is to create a sustainable marketplace where people can rent premium 
                products without the burden of buying them.
              </p>
              <p className="text-muted-foreground mb-4">
                We're building a platform that connects people who have quality items to share with 
                those who need them temporarily. This reduces waste, saves money, and promotes a 
                more sustainable way of living.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Founded in 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Made with passion</span>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1170&auto=format&fit=crop"
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do and help us serve our community better.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-muted-foreground">
              Numbers that show our growing community and commitment to excellence.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section with Image */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative h-[400px] rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1170&auto=format&fit=crop"
                alt="Future vision"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
              <p className="text-muted-foreground mb-4">
                We envision a future where the sharing economy is the norm, not the exception. 
                A world where people have access to everything they need, when they need it, 
                without the environmental and financial costs of ownership.
              </p>
              <p className="text-muted-foreground mb-4">
                Through technology and community, we're making this vision a reality—one rental at a time.
              </p>
              <div className="mt-6 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                <p className="text-sm italic">
                  "Access over ownership is not just a business model—it's a movement towards 
                  sustainable living and conscious consumption."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

