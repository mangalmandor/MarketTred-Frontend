import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../../services/socket';
import { fetchChatHistory, sendMessage, receiveMessage, clearMessages, deleteChat, handleNewInquiry, fetchAllConversations } from '../../features/chat/chatSlice';
import { fetchProducts } from '../../features/products/productSlice';
import Swal from 'sweetalert2';

const ChatRoom = () => {
    const { otherUserId, productId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { messages, isLoading, isSending, conversations } = useSelector((state) => state.chat);
    const [newMessage, setNewMessage] = useState('');
    const [otherUserStatus, setOtherUserStatus] = useState({
        isOnline: false,
        lastSeen: null
    });
    const scrollRef = useRef(null);

    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (productId) {
            dispatch(fetchProducts());
        }
    }, [dispatch, productId]);

    useEffect(() => {
        // ==========================================
        // 1. THE TOKEN LOCK (Live Site Fix)
        // ==========================================
        const token = localStorage.getItem('token');

        if (!token) {
            console.log("⏳ Token not ready yet, holding connection...");
            return;
        }

        console.log("✅ Token secured. Connecting to WebSockets!");
        socket.auth = { token };
        socket.connect();


        // ==========================================
        // 2. Fetch history and join room
        // ==========================================
        dispatch(fetchChatHistory({ otherUserId, productId }));

        if (user?._id && otherUserId && productId) {
            socket.emit('joinRoom', { userId: user._id, otherUserId, productId });
        }

        // ==========================================
        // 3. Setup Listeners
        // ==========================================

        // Message Listener
        const handleReceiveMessage = (message) => {
            const incomingProductId = message.productId || message.product?._id || message.product;
            if (incomingProductId && String(incomingProductId) === String(productId)) {
                dispatch(receiveMessage(message));
            } else {
                dispatch(handleNewInquiry(message));
            }
        };

        // Typing Listeners
        const handleUserTyping = (data) => {
            if (String(data.productId) === String(productId)) setIsOtherUserTyping(true);
        };
        const handleUserStoppedTyping = (data) => {
            if (String(data.productId) === String(productId)) setIsOtherUserTyping(false);
        };

        // 👈 NEW: Status (Last Seen / Online) Listener
        const handleStatusUpdate = (data) => {
            if (String(data.userId) === String(otherUserId)) {
                console.log("👤 User Status Changed:", data);
                setOtherUserStatus({
                    isOnline: data.isOnline,
                    lastSeen: data.lastSeen
                });
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('userTyping', handleUserTyping);
        socket.on('userStoppedTyping', handleUserStoppedTyping);
        socket.on('statusUpdate', handleStatusUpdate); // 👈 Attach here

        // 1. Jaise hi connect ho, saamne waale ka status mango
        socket.emit('requestStatus', {
            targetUserId: otherUserId,
            requesterId: user._id
        });

        // 2. Agar koi mujhse mera status maange, toh use reply do
        socket.on('getPresenceRequest', (data) => {
            socket.emit('respondStatus', {
                requesterId: data.requesterId,
                status: true, // Main online hoon tabhi toh ye sun raha hoon
                lastSeen: new Date()
            });
        });

        // 3. Status update suno (Jo pehle se likha hai)
        socket.on('statusUpdate', (data) => {
            if (String(data.userId) === String(otherUserId)) {
                setOtherUserStatus({ isOnline: data.isOnline, lastSeen: data.lastSeen });
            }
        });

        // ==========================================
        // 4. Cleanup when the user leaves
        // ==========================================
        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('userTyping', handleUserTyping);
            socket.off('userStoppedTyping', handleUserStoppedTyping);
            socket.off('statusUpdate', handleStatusUpdate); // 👈 Detach here

            dispatch(clearMessages());
            socket.disconnect();
        };
    }, [dispatch, otherUserId, productId, user?._id]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {

        if (messages && messages.length > 0) {

            // Check karo kya ye chat pehle se left sidebar (conversations list) mein maujood hai?
            const chatExists = conversations.some(c =>
                String(c.product?._id || c.product) === String(productId) &&
                (String(c.seller?._id || c.seller) === String(otherUserId) || String(c.buyer?._id || c.buyer) === String(otherUserId))
            );

            //Agar chat pehli baar hui hai aur sidebar mein dabba nahi hai
            if (!chatExists) {
                // Background mein list refresh kar lo taaki naya dabba UI mein aa jaye
                dispatch(fetchAllConversations());
            }
        }
    }, [messages.length, conversations, dispatch, productId, otherUserId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        // 1. FAKE ID mat banao! Sirf zaroori data bhejo. 
        // (_id aur createdAt backend MongoDB khud generate karega)
        const messagePayload = {
            receiverId: otherUserId,
            productId,
            content: newMessage,
            sender: user._id,
        };

        try {
            setNewMessage(''); // Input box turant khali kar do taaki user ko fast lage

            socket.emit('stopTyping', { senderId: user._id, receiverId: otherUserId, productId });

            const savedMessage = await dispatch(sendMessage(messagePayload)).unwrap();

            socket.emit('sendMessage', savedMessage);

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Message Failed',
                text: 'Your message could not be saved to the database. Please check your connection.',
                background: '#111827',
                color: '#f3f4f6',
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'border border-gray-800 rounded-2xl shadow-2xl',
                }
            });
        }
    };
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Delete Chat?',
            text: "This will permanently remove the conversation. You cannot undo this.",
            icon: 'warning',
            showCancelButton: true,
            background: '#111827',
            color: '#f3f4f6',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Yes, delete it',
            customClass: {
                popup: 'border border-gray-800 rounded-2xl shadow-2xl',
            }
        });

        if (result.isConfirmed) {
            try {
                await dispatch(deleteChat({ otherUserId, productId })).unwrap();
                navigate(-1);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Delete Failed',
                    text: 'Could not delete the chat.',
                    background: '#111827',
                    color: '#f3f4f6',
                });
            }
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        console.log("📤 Sending typing event to user:", otherUserId);

        // Tell the server we are typing
        socket.emit('typing', {
            senderId: user._id,
            receiverId: otherUserId,
            productId
        });

        // Clear the old timer
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set a new timer to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', {
                senderId: user._id,
                receiverId: otherUserId,
                productId
            });
        }, 2000);
    };

    return (
        <div className="flex items-center justify-center w-full h-[100dvh] bg-[#050505] overflow-hidden sm:p-6 lg:p-10 relative z-0 selection:bg-blue-500/30 selection:text-blue-200">

            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-1/4 w-[40vw] h-[40vw] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] right-1/4 w-[30vw] h-[30vw] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="flex flex-col w-full max-w-5xl h-full sm:h-[88vh] bg-[#0A0A0A]/90 backdrop-blur-3xl sm:rounded-[2.5rem] sm:border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative z-10 overflow-hidden mt-48">

                {/* Header (Fixed) */}
                <header className="flex-shrink-0 bg-gray-900/40 border-b border-gray-800/80 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm gap-3">

                    {/* Left side: Back button + Title */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <button onClick={() => navigate(-1)} className="..."> {/* Back Button code same rahega */} </button>

                        <div className="min-w-0">
                            <h2 className="text-base sm:text-lg md:text-xl font-black text-gray-100 tracking-tight truncate">
                                Negotiation Room
                            </h2>

                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                {/* Status Indicator Dot */}
                                <span className="relative flex h-2 w-2 flex-shrink-0">
                                    {otherUserStatus.isOnline && (
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    )}
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${otherUserStatus.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-gray-600'
                                        }`}></span>
                                </span>

                                {/* Status Text Logic */}
                                {isOtherUserTyping ? (
                                    <p className="text-[9px] sm:text-[10px] md:text-xs text-emerald-400 font-bold uppercase tracking-widest truncate">
                                        typing....
                                    </p>
                                ) : otherUserStatus.isOnline ? (
                                    <p className="text-[9px] sm:text-[10px] md:text-xs text-emerald-500 font-bold uppercase tracking-widest truncate">
                                        Online
                                    </p>
                                ) : (
                                    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest truncate">
                                        {otherUserStatus.lastSeen
                                            ? `Last seen: ${new Date(otherUserStatus.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            : 'Offline'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right side: SUPER VISIBLE DELETE BUTTON */}
                    <button
                        onClick={handleDelete}
                        title="Delete Chat"
                        className="flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2 bg-red-600/10 border-2 border-red-600/50 text-red-500 rounded-xl sm:rounded-2xl font-black hover:bg-red-600 hover:border-red-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 group"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="text-xs sm:text-sm tracking-wide">Delete</span>
                    </button>

                </header>

                {/* Chat Feed */}
                <main className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar min-h-0">
                    {messages.length === 0 && !isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center bg-gray-900/30 p-6 sm:p-8 rounded-3xl border border-gray-800/50 max-w-[80%]">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                </div>
                                <p className="text-gray-400 text-xs sm:text-sm font-medium tracking-wide">Start the conversation to negotiate the deal.</p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                        const isMe = senderId === user?._id;

                        return (
                            <div key={msg._id || index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                <div className={`relative max-w-[85%] md:max-w-[70%] px-4 sm:px-5 py-3 sm:py-3.5 rounded-[1.2rem] sm:rounded-[1.5rem] text-sm md:text-base ${isMe
                                    ? 'bg-blue-600 text-white rounded-br-sm shadow-[0_4px_20px_rgba(37,99,235,0.25)]'
                                    : 'bg-gray-800/60 text-gray-100 rounded-bl-sm border border-gray-700/50 shadow-sm backdrop-blur-sm'
                                    }`}>
                                    <p className="leading-relaxed font-medium break-words">{msg.content}</p>
                                    <div className={`text-[9px] sm:text-[10px] mt-1.5 sm:mt-2 flex items-center gap-1.5 font-semibold tracking-wider ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} className="h-1" />
                </main>

                {/* Input Footer (Fixed) */}
                <footer className="flex-shrink-0 bg-gray-900/40 border-t border-gray-800/80 p-3 sm:p-4 md:p-6 z-20">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3 bg-gray-800/30 p-1 sm:p-1.5 pl-4 sm:pl-6 rounded-[1.2rem] sm:rounded-2xl border border-gray-700/50 focus-within:border-blue-500/50 focus-within:bg-gray-800/50 transition-all shadow-inner">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={handleTyping}
                            className="flex-grow bg-transparent border-none focus:ring-0 text-gray-100 font-medium placeholder-gray-500 text-sm sm:text-base py-2.5 sm:py-3 outline-none"
                            required
                        />

                        <button
                            disabled={isSending}
                            onClick={handleSendMessage}
                            className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-[1rem] sm:rounded-xl transition-all flex items-center justify-center ${isSending
                                ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]'
                                }`}
                        >
                            {isSending ? (
                                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </form>
                    <p className="text-[9px] sm:text-[10px] text-center text-gray-600 mt-2 sm:mt-3 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        End-to-End Encrypted
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default ChatRoom;