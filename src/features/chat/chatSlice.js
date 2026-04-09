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

        // handleNewInquiry: (state, action) => {
        //     const newMessage = action.payload;
        //     if (!newMessage) return;

        //     // 1. Incoming IDs ko safely nikaalo (String conversion is key)
        //     const pIdIncoming = (newMessage.product?._id || newMessage.product || "").toString();
        //     const bIdIncoming = (newMessage.buyer?._id || newMessage.buyer || "").toString();

        //     // 2. Purani list ko filter karo taaki duplicate remove ho jaye
        //     const filteredConversations = state.conversations.filter(c => {
        //         const pId = (c.product?._id || c.product || "").toString();
        //         const bId = (c.buyer?._id || c.buyer || "").toString();

        //         // Agar IDs match nahi karte, toh use list mein rehne do
        //         return !(pId === pIdIncoming && bId === bIdIncoming);
        //     });

        //     // 3. Naya Inquiry object tayyar karo
        //     const updatedInquiry = {
        //         ...newMessage,
        //         isUnread: true, // 👈 Green dot isi par chalta hai
        //         lastMessage: newMessage.content || newMessage.lastMessage,
        //         updatedAt: new Date().toISOString() // 👈 Sorting ke liye
        //     };

        //     // 4. THE TRIGGER: Naya array reference create karo
        //     // Isse React Sidebar ko "Signal" milega ki data change hua hai
        //     state.conversations = [updatedInquiry, ...filteredConversations];

        //     // 5. Unread Count recalculate karo
        //     state.unreadCount = state.conversations.filter(c => c.isUnread).length;
        // },

        // handleNewInquiry: (state, action) => {
        //     const newMessage = action.payload;
        //     if (!newMessage) return;

        //     const pIdIncoming = (newMessage.product?._id || newMessage.product || "").toString();
        //     const bIdIncoming = (newMessage.buyer?._id || newMessage.buyer || "").toString();

        //     // 1. Purani list ko filter karo
        //     const filtered = state.conversations.filter(c => {
        //         const pId = (c.product?._id || c.product || "").toString();
        //         const bId = (c.buyer?._id || c.buyer || "").toString();
        //         return !(pId === pIdIncoming && bId === bIdIncoming);
        //     });

        //     // 2. Naya object tayyar karo
        //     const updatedChat = {
        //         ...newMessage,
        //         isUnread: true,
        //         updatedAt: new Date().toISOString()
        //     };

        //     // 3. 👈 THE FIX: Direct assignment with a fresh array
        //     // Isse React ka 'Selector' force-trigger hoga
        //     state.conversations = [updatedChat, ...filtered];

        //     // 4. State ko mutate mat karo, naya count calculate karo
        //     state.unreadCount = state.conversations.filter(c => c.isUnread).length;
        // },

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
