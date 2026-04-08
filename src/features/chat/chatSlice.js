import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchChatHistory = createAsyncThunk(
    'chat/fetchHistory',
    async ({ otherUserId, productId }, { rejectWithValue }) => {
        if (!otherUserId || !productId || otherUserId === 'null' || productId === 'null') {
            console.error("Missing IDs for fetchChatHistory");
            return rejectWithValue("Missing User or Product ID");
        }
        try {
            const response = await api.get(`/chat/${otherUserId}/${productId}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);

        }
    }
);
export const fetchAllConversations = createAsyncThunk(
    'chat/fetchAllConversations',
    async () => {
        const response = await api.get('/chat/conversations');
        return response.data;
    },
);

export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async (messageData) => {
        const response = await api.post('/chat/send',);
        return response.data;
    }
);

export const deleteChat = createAsyncThunk(
    'chat/delete',
    async ({ otherUserId, productId }, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/chat/${otherUserId}/${productId}`);
            return { otherUserId, productId };
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to delete chat");
        }
    }
);
const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        messages: [],
        conversations: [],
        isLoading: false,
        unreadCount: 0
    },
    reducers: {
        receiveMessage: (state, action) => {
            const exists = state.messages.find(m => m._id === action.payload._id);
            if (!exists) {
                state.messages.push(action.payload);
            }
        },

        handleNewInquiry: (state, action) => {
            const newMessage = action.payload;

            if (!newMessage.product || !newMessage.buyer) return;

            const pIdIncoming = (newMessage.product?._id || newMessage.product).toString();
            const bIdIncoming = (newMessage.buyer?._id || newMessage.buyer).toString();

            const existingIndex = state.conversations.findIndex(c => {
                const pId = (c.product?._id || c.product).toString();
                const bId = (c.buyer?._id || c.buyer).toString();
                return pId === pIdIncoming && bId === bIdIncoming;
            });

            const updatedInquiry = {
                ...newMessage,
                lastMessage: newMessage.content || newMessage.lastMessage,
                isUnread: true
            };

            if (existingIndex !== -1) {
                state.conversations.splice(existingIndex, 1);
            }

            state.conversations = [updatedInquiry, ...state.conversations];
            state.unreadCount = state.conversations.filter(c => c.isUnread).length;
        },

        markAsRead: (state, action) => {
            const { productId, buyerId } = action.payload;
            const convo = state.conversations.find(c =>
                (c.product?._id || c.product).toString() === productId.toString() &&
                (c.buyer?._id || c.buyer).toString() === buyerId.toString()
            );
            if (convo) {
                convo.isUnread = false;
                state.unreadCount = state.conversations.filter(c => c.isUnread).length;
            }
        },

        clearMessages: (state) => {
            state.messages = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChatHistory.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchChatHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.messages = action.payload;
            })
            .addCase(fetchAllConversations.fulfilled, (state, action) => {
                // 🚩 Filter out any broken conversations from backend
                state.conversations = action.payload.filter(c => c.product && c.buyer);
                state.unreadCount = state.conversations.filter(c => c.isUnread).length;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                const exists = state.messages.find(m => m._id === action.payload._id);
                if (!exists) {
                    state.messages.push(action.payload);
                }
            })
            .addCase(deleteChat.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteChat.fulfilled, (state, action) => {
                state.isLoading = false;
                const { otherUserId, productId } = action.payload;

                state.messages = [];

                state.conversations = state.conversations.filter(chat => {
                    const isTargetChat =
                        (chat.seller._id === otherUserId || chat.buyer._id === otherUserId) &&
                        chat.product._id === productId;
                    return !isTargetChat;
                });
            })
            .addCase(deleteChat.rejected, (state) => {
                state.isLoading = false;
            });

    },
});

export const { receiveMessage, clearMessages, handleNewInquiry, markAsRead } = chatSlice.actions;
export default chatSlice.reducer;
