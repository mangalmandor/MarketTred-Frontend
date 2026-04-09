import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { connectSocket, disconnectSocket } from '../../services/socket';

export const registerUser = createAsyncThunk('auth/register', async (email) => {
    const response = await api.post('/auth/register', { email });
    return response.data;
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (userData) => {
    const response = await api.post('/auth/verify-otp', userData);
    return response.data;
});

export const loginUser = createAsyncThunk('auth/login', async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
        _id: response.data._id,
        name: response.data.name,
        role: response.data.role
    }));
    connectSocket(response.data.token);
    return response.data;
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // localStorage.removeItem('cartItems');
    disconnectSocket();
    return null;
});

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
            });
    },
});

export default authSlice.reducer;
