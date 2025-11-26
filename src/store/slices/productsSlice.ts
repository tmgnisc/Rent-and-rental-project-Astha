import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ProductCategory = 'electronics' | 'fashion' | 'appliances' | 'sports';
export type RentalStatus = 'available' | 'rented' | 'maintenance';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  image: string;
  rentalPricePerDay: number;
  refundableDeposit: number;
  vendor: {
    id: string;
    name: string;
    rating: number;
  };
  status: RentalStatus;
  specifications?: Record<string, string>;
}

interface ProductsState {
  products: Product[];
  selectedCategory: ProductCategory | 'all';
  loading: boolean;
  searchTerm: string;
  maxPriceFilter: number | null;
}

const initialState: ProductsState = {
  products: [],
  selectedCategory: 'all',
  loading: false,
  searchTerm: '',
  maxPriceFilter: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setCategory: (state, action: PayloadAction<ProductCategory | 'all'>) => {
      state.selectedCategory = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setMaxPriceFilter: (state, action: PayloadAction<number | null>) => {
      state.maxPriceFilter = action.payload;
    },
  },
});

export const { setProducts, setCategory, setLoading, setSearchTerm, setMaxPriceFilter } =
  productsSlice.actions;
export default productsSlice.reducer;
