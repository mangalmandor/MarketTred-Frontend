import { createSlice } from '@reduxjs/toolkit';

const savedItems = JSON.parse(localStorage.getItem('cartItems')) || [];

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: savedItems,
        isLoading: false,
    },
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const exists = state.items.find(item => item._id === product._id);
            if (!exists) {
                state.items.push(product);
                localStorage.setItem('cartItems', JSON.stringify(state.items));
            }
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item._id !== action.payload);
            localStorage.setItem('cartItems', JSON.stringify(state.items));
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.removeItem('cartItems');
        }
    },
    extraReducers: (builder) => {
        builder
    }
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
