import { createSlice } from '@reduxjs/toolkit';

// 1. Pehle se saved items nikaalo (agar hain toh)
const savedItems = JSON.parse(localStorage.getItem('cartItems')) || [];

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: savedItems, // 🚩 Khali [] ki jagah savedItems use karo
        isLoading: false,
    },
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const exists = state.items.find(item => item._id === product._id);

            if (!exists) {
                state.items.push(product);
                // 2. LocalStorage mein save karo
                localStorage.setItem('cartItems', JSON.stringify(state.items));
            }
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item._id !== action.payload);
            // 3. Update hone ke baad phir se save karo
            localStorage.setItem('cartItems', JSON.stringify(state.items));
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.removeItem('cartItems');
        }
    }
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;