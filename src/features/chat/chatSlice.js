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
        const response = await api.post('/chat/send', messageData);
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
            // 1. Log the incoming data
            console.log("🟡 REDUX ATTEMPT: receiveMessage fired", action.payload);

            // 2. Standardize IDs (Check both _id and id)
            const incomingId = action.payload._id || action.payload.id;

            // 3. Check if it already exists to prevent double-rendering
            const exists = state.messages.find(m => (m._id || m.id) === incomingId);

            if (!exists) {
                // 4. THE MAGIC: Use the spread operator to create a NEW array reference
                // This is what forces React to re-render the UI immediately
                state.messages = [...state.messages, action.payload];

                console.log("🟢 REDUX SUCCESS: New count:", state.messages.length);
            } else {
                console.warn("🟠 REDUX SKIP: Duplicate message detected.");
            }
        },


        handleNewInquiry: (state, action) => {
            const newMessage = action.payload;
            if (!newMessage) return;

            // 1. Incoming IDs ko safely nikaalo (Backend kabhi 'sender' bhejta hai, kabhi 'buyer')
            const pIdIncoming = (newMessage.product?._id || newMessage.product || newMessage.productId || "").toString();
            const bIdIncoming = (newMessage.buyer?._id || newMessage.buyer || newMessage.sender?._id || newMessage.sender || "").toString();

            // 2. Check karo ki kya ye chat UI mein pehle se majood hai?
            const existingIndex = state.conversations.findIndex(c => {
                const pId = (c.product?._id || c.product || "").toString();
                const bId = (c.buyer?._id || c.buyer || "").toString();
                return pId === pIdIncoming && bId === bIdIncoming;
            });

            // 3. Ek naya array banao taaki React re-render ho
            let newConversations = [...state.conversations];

            if (existingIndex !== -1) {
                // 👈 THE MAGIC: Agar chat pehle se hai, toh uski IMAGE aur TITLE bacha kar rakho
                const existingChat = newConversations[existingIndex];

                const updatedChat = {
                    ...existingChat, // Purana data (Image, Title) waise ka waisa rakho
                    isUnread: true,  // 👈 Green Dot on kar do
                    lastMessage: newMessage.content || newMessage.lastMessage || existingChat.lastMessage,
                    updatedAt: new Date().toISOString()
                };

                // Purani jagah se nikalo aur list mein sabse UPAR (Top) daal do
                newConversations.splice(existingIndex, 1);
                newConversations.unshift(updatedChat);
            } else {
                // Agar bilkul nayi chat hai
                const updatedChat = {
                    ...newMessage,
                    isUnread: true,
                    lastMessage: newMessage.content || newMessage.lastMessage,
                    updatedAt: new Date().toISOString()
                };
                newConversations.unshift(updatedChat);
            }

            // 4. Finally state update kar do
            state.conversations = newConversations;
            state.unreadCount = state.conversations.filter(c => c.isUnread).length;
        },

        markAsRead: (state, action) => {
            // 1. Data nikalo (User kisi bhi Dashboard se kuch bhi pass kare)
            const { productId, buyerId } = action.payload;

            const pIdToMatch = String(productId?._id || productId);
            // Hume nahi pata dashboard ne buyer bheja hai ya seller, bas ID nikal lo
            const userToMatch = String(buyerId?._id || buyerId);

            // 2. 👈 THE MAGIC: Hum find() ki jagah map() use karenge!
            // map() hamesha naya array (Naya Dabba) banata hai, toh React 100% re-render hoga
            state.conversations = state.conversations.map(c => {
                const cProduct = String(c.product?._id || c.product);
                const cBuyer = String(c.buyer?._id || c.buyer);
                const cSeller = String(c.seller?._id || c.seller); // Seller id bhi check karenge

                // Agar Product match ho jaye, AUR (Buyer ya Seller mein se koi ek ID match ho jaye)
                if (cProduct === pIdToMatch && (cBuyer === userToMatch || cSeller === userToMatch)) {
                    return { ...c, isUnread: false }; // 👈 Naya Object reference! Green dot gayab!
                }

                return c; // Agar match na ho toh waise hi rehne do
            });

            // 3. Count update kar do
            state.unreadCount = state.conversations.filter(c => c.isUnread).length;
        },
        clearMessages: (state) => {
            state.messages = []; // Ya jo bhi tumhara state clear karne ka logic ho
            // 3. Reset the green dot / unread notification count
            state.unreadCount = 0;

            // 4. (Optional but good) Remove any residual storage if you ever use it
            localStorage.removeItem('chatHistory');
        },
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
                state.isLoading = false;

                // 1. Tumhara logic: Pehle broken chats ko filter kar lo
                const validFreshChats = action.payload.filter(c => c.product && c.buyer);

                // 2. Naya logic: Ab in fresh chats mein purane Green Dots (isUnread) wapas lagao
                state.conversations = validFreshChats.map(freshChat => {
                    // Purani list mein chat dhoondo
                    const oldChat = state.conversations.find(c =>
                        (c.product?._id || c.product) === (freshChat.product?._id || freshChat.product) &&
                        (c.buyer?._id || c.buyer) === (freshChat.buyer?._id || freshChat.buyer)
                    );

                    // Agar us par pehle se green dot tha, toh naye wale par bhi laga do
                    if (oldChat && oldChat.isUnread) {
                        return { ...freshChat, isUnread: true };
                    }
                    return freshChat;
                });

                // 3. Bell count update kar do
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
