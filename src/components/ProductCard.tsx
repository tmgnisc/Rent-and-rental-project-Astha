import { Product } from '@/store/slices/productsSlice';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

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
    <Card 
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] border-0"
      style={{ boxShadow: 'var(--shadow-card)' }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <Badge className={getStatusColor(product.status)} variant="secondary">
            {product.status}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="text-xs capitalize mb-2">
            {product.category}
          </Badge>
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span className="font-medium">{product.vendor.name}</span>
          <div className="flex items-center gap-1 ml-auto">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="font-medium">{product.vendor.rating}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">₹{product.rentalPricePerDay}</span>
          <span className="text-sm text-muted-foreground">/day</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          + ₹{product.refundableDeposit} refundable deposit
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          disabled={product.status !== 'available'}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product.id}`);
          }}
        >
          {product.status === 'available' ? 'Rent Now' : 'Not Available'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
