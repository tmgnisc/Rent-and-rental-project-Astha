import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '@/store/store';
import { setProducts, setCategory } from '@/store/slices/productsSlice';
import { mockProducts } from '@/data/mockProducts';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import { ProductCategory } from '@/store/slices/productsSlice';
import Footer from '@/components/Footer';

const Products = () => {
  const { category } = useParams<{ category?: ProductCategory }>();
  const dispatch = useDispatch();
  const { products, selectedCategory } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(setProducts(mockProducts));
  }, [dispatch]);

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
