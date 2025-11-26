import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  setProducts,
  setCategory,
  setLoading,
  ProductCategory,
  Product,
  setSearchTerm,
  setMaxPriceFilter,
} from '@/store/slices/productsSlice';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const Products = () => {
  const { category } = useParams<{ category?: ProductCategory }>();
  const dispatch = useDispatch();
  const { products, selectedCategory, loading, searchTerm, maxPriceFilter } = useSelector(
    (state: RootState) => state.products
  );

  const loadProducts = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const query = new URLSearchParams({ status: 'available' }).toString();
      const data = await apiRequest<{ success: boolean; products: Product[] }>(`/public/products?${query}`);
      dispatch(setProducts(data.products));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
  }, [loadProducts, products.length]);

  useEffect(() => {
    if (category) {
      dispatch(setCategory(category as ProductCategory));
    }
  }, [category, dispatch]);

  const highestPrice = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.max(...products.map((product) => Number(product.rentalPricePerDay) || 0));
  }, [products]);

  useEffect(() => {
    if (highestPrice > 0 && (maxPriceFilter === null || maxPriceFilter === 0)) {
      dispatch(setMaxPriceFilter(highestPrice));
    }
  }, [dispatch, highestPrice, maxPriceFilter]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const priceCap = maxPriceFilter || highestPrice || 0;

    return products
      .filter((product) => (selectedCategory === 'all' ? true : product.category === selectedCategory))
      .filter((product) => {
        if (!normalizedSearch) return true;
        const haystack = `${product.name} ${product.description} ${product.vendor?.name ?? ''}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      })
      .filter((product) => {
        if (!priceCap) return true;
        return Number(product.rentalPricePerDay) <= priceCap;
      });
  }, [products, selectedCategory, searchTerm, maxPriceFilter, highestPrice]);

  const categoryTitle =
    selectedCategory === 'all'
      ? 'All Products'
      : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  const handlePriceChange = (value: number[]) => {
    dispatch(setMaxPriceFilter(value[0]));
  };

  const resetFilters = () => {
    dispatch(setSearchTerm(''));
    dispatch(setMaxPriceFilter(highestPrice));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{categoryTitle}</h1>
            <p className="text-muted-foreground">
              {loading ? 'Loading our latest rentals...' : `Browse our collection of ${filteredProducts.length} products`}
            </p>
          </div>

          <CategoryFilter />

          <div className="grid gap-4 md:grid-cols-[2fr,1fr] mb-8">
            <div>
              <Label htmlFor="product-search" className="text-sm font-medium">
                Search products
              </Label>
              <Input
                id="product-search"
                placeholder="Search by product name, vendor, or keyword"
                value={searchTerm}
                onChange={handleSearchChange}
                className="mt-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Max price per day</Label>
                <span className="text-sm text-muted-foreground">
                  ₹{(maxPriceFilter || highestPrice || 0).toFixed(0)}
                </span>
              </div>
              <Slider
                className="mt-4"
                min={0}
                step={50}
                max={Math.max(highestPrice, 500)}
                value={[maxPriceFilter || highestPrice || 0]}
                onValueChange={handlePriceChange}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </p>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset filters
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
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
