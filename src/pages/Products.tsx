import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '@/store/store';
import { setProducts, setCategory, setLoading, ProductCategory, Product } from '@/store/slices/productsSlice';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import Footer from '@/components/Footer';

const Products = () => {
  const { category } = useParams<{ category?: ProductCategory }>();
  const dispatch = useDispatch();
  const { products, selectedCategory, loading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
  }, [dispatch, products.length]);

  const loadProducts = async () => {
    dispatch(setLoading(true));
    try {
      const data = await apiRequest<{ success: boolean; products: Product[] }>('/public/products');
      dispatch(setProducts(data.products));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (category) {
      dispatch(setCategory(category as ProductCategory));
    }
  }, [category, dispatch]);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const categoryTitle = selectedCategory === 'all' 
    ? 'All Products' 
    : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{categoryTitle}</h1>
            <p className="text-muted-foreground">
              Browse our collection of {filteredProducts.length} products
            </p>
          </div>

          <CategoryFilter />

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
