import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import axios from 'axios'; // Iski zaroorat padegi search cancel check ke liye

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    // ✨ NAYA: Default parameters add kiye hain taaki purani bina args wali calls crash na hon
    async ({ page = 1, limit = 12 } = {}, { rejectWithValue }) => {
        try {
            // ✨ NAYA: Query parameters mein page aur limit pass kar rahe hain
            const response = await api.get(`/products?page=${page}&limit=${limit}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch products");
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/products/${productId}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch product details");
        }
    }
);

export const addProduct = createAsyncThunk(
    'products/addProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const response = await api.post('/products', productData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to add product");
        }
    }
);

export const searchProducts = createAsyncThunk(
    'products/searchProducts',
    // ✨ NAYA: search ke sath ab page aur limit bhi accept karega
    async ({ searchTerm, page = 1, limit = 12, signal }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/products/search?search=${searchTerm}&page=${page}&limit=${limit}`, { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) {
                return rejectWithValue('cancelled');
            }
            return rejectWithValue(error.response?.data || "Search failed");
        }
    }
);

export const updateProduct = createAsyncThunk(
    'products/updateProduct',
    async ({ id, productData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/products/${id}`, productData);
            return response.data.product;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to update product");
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'products/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/products/${id}`);
            return response.data.id;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to delete product");
        }
    }
);

const initialState = {
    items: [],
    allAvailableItems: [], // Tumhara custom field
    currentProduct: null,
    sellerInfo: null,
    isLoading: false,
    error: null,
    // ✨ NAYA (PAGINATION) ✨: Pagination states add kar diye
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        resetSearchResults: (state) => {
            state.items = state.allAvailableItems;
            state.error = null;
        },
        clearProductError: (state) => {
            state.error = null;
        },
        clearProductDetails: (state) => {
            state.currentProduct = null;
            state.sellerInfo = null;
        },
        clearSearch: (state) => {
            state.items = [];
        },
        // ✨ NAYA (PAGINATION) ✨: Page control karne ke liye reducers
        setPage: (state, action) => {
            state.currentPage = action.payload;
        },
        resetPage: (state) => {
            state.currentPage = 1;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                // ✨ NAYA (PAGINATION SAFEGUARD) ✨
                // Check if backend sent the new paginated object { products, totalPages... }
                // OR if it's still sending the old plain array [ {...}, {...} ]
                if (action.payload.products) {
                    state.items = action.payload.products;
                    state.allAvailableItems = action.payload.products;
                    state.currentPage = action.payload.currentPage || 1;
                    state.totalPages = action.payload.totalPages || 1;
                    state.totalProducts = action.payload.totalProducts || 0;
                } else {
                    // Fallback for old backend logic (taaki app crash na ho)
                    state.items = action.payload;
                    state.allAvailableItems = action.payload;
                }
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Fetch Product By ID (Untouched)
            .addCase(fetchProductById.pending, (state) => {
                state.isLoading = true;
                state.currentProduct = null;
                state.sellerInfo = null;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProduct = action.payload;
                state.sellerInfo = action.payload.seller;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Search Products
            .addCase(searchProducts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(searchProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                // ✨ NAYA (PAGINATION SAFEGUARD) ✨
                if (action.payload.products) {
                    state.items = action.payload.products;
                    state.currentPage = action.payload.currentPage || 1;
                    state.totalPages = action.payload.totalPages || 1;
                    state.totalProducts = action.payload.totalProducts || 0;
                } else {
                    state.items = action.payload;
                }
            })
            .addCase(searchProducts.rejected, (state, action) => {
                if (action.payload !== 'cancelled') {
                    state.isLoading = false;
                    state.error = action.payload;
                }
            })

            // Add Product (Untouched)
            .addCase(addProduct.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items.push(action.payload);
            })
            .addCase(addProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Update Product (Untouched)
            .addCase(updateProduct.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.items.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Delete Product (Untouched)
            .addCase(deleteProduct.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = state.items.filter(p => p._id !== action.payload);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearProductError, clearProductDetails, clearSearch, resetSearchResults, setPage, resetPage } = productSlice.actions; // ✨ NAYA: setPage, resetPage export kiya hai
export default productSlice.reducer;