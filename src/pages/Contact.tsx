import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import Footer from '@/components/Footer';

const Contact = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Redirect vendors and superadmins to their dashboards
  useEffect(() => {
    if (user && (user.role === 'vendor' || user.role === 'superadmin')) {
      navigate(user.role === 'vendor' ? '/dashboard/vendor' : '/dashboard/superadmin', { replace: true });
    }
  }, [user, navigate]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@rentreturn.com',
      link: 'mailto:support@rentreturn.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+977 98XX-XXXXXX',
      link: 'tel:+977',
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'Kathmandu, Nepal',
      link: null,
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: 'Mon - Fri: 9AM - 6PM',
      link: null,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions or feedback? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your full name"
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
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info & Image */}
            <div className="space-y-6">
              <div className="relative h-[250px] rounded-xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=1174&auto=format&fit=crop"
                  alt="Contact us"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Contact Information</h3>
                <p className="text-muted-foreground">
                  Reach out to us through any of these channels. We're here to help!
                </p>

                <div className="space-y-4 mt-6">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    const content = (
                      <div className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">{info.title}</h4>
                          <p className="text-sm text-muted-foreground">{info.value}</p>
                        </div>
                      </div>
                    );

                    return info.link ? (
                      <a key={index} href={info.link} className="block">
                        {content}
                      </a>
                    ) : (
                      <div key={index}>{content}</div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Quick answers to common questions. Can't find what you're looking for? 
                Contact us directly!
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I rent a product?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Browse our products, select your rental period, and proceed to checkout. 
                    After payment, coordinate with the vendor for pickup or delivery.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What if I need to return early?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You can request an early return through your dashboard. The vendor will 
                    review and process your return request. Refunds are handled on a case-by-case basis.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I become a vendor?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sign up and select "Vendor" as your role. Complete the verification process 
                    by uploading your documents. Once approved, you can start listing products!
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is my payment secure?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! We use Stripe for payment processing, which provides bank-level security 
                    and encryption for all transactions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;

