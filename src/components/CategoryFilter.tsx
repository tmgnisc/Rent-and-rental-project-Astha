import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCategory } from '@/store/slices/productsSlice';
import { Button } from '@/components/ui/button';
import { Laptop, Shirt, Home, Dumbbell, Grid2X2 } from 'lucide-react';

const categories = [
  { value: 'all', label: 'All Products', icon: Grid2X2 },
  { value: 'electronics', label: 'Electronics', icon: Laptop },
  { value: 'fashion', label: 'Fashion', icon: Shirt },
  { value: 'appliances', label: 'Appliances', icon: Home },
  { value: 'sports', label: 'Sports', icon: Dumbbell },
] as const;

const CategoryFilter = () => {
  const dispatch = useDispatch();
  const selectedCategory = useSelector((state: RootState) => state.products.selectedCategory);

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.value;
        
        return (
          <Button
            key={category.value}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => dispatch(setCategory(category.value))}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
