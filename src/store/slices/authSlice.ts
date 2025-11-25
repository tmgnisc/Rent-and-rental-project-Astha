import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

let parsedUser: User | null = null;
if (storedUser) {
  try {
    parsedUser = JSON.parse(storedUser) as User;
  } catch (error) {
    localStorage.removeItem('user');
  }
}

const initialState: AuthState = {
  user: parsedUser,
  token: storedToken,
  isAuthenticated: Boolean(storedToken && parsedUser),
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
