import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../../services/socket';
import { fetchChatHistory, sendMessage, receiveMessage, clearMessages } from '../../features/chat/chatSlice';
import { fetchProducts } from '../../features/products/productSlice';
import Swal from 'sweetalert2';

const ChatRoom = () => {
    const { otherUserId, productId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { messages, isLoading, isSending } = useSelector((state) => state.chat);
    const [newMessage, setNewMessage] = useState('');

    const scrollRef = useRef(null);

    useEffect(() => {
        if (productId) {
            dispatch(fetchProducts());
        }
    }, [dispatch, productId]);

    useEffect(() => {
        dispatch(fetchChatHistory({ otherUserId, productId }));
        socket.emit('joinRoom', { userId: user?._id, otherUserId, productId });

        const handleReceiveMessage = (message) => {
            const incomingProductId = message.product?._id || message.product;

            if (incomingProductId === productId) {
                dispatch(receiveMessage(message));
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            dispatch(clearMessages());
        };
    }, [dispatch, otherUserId, productId, user?._id]);
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const messageData = {
            _id: Date.now().toString(),
            receiverId: otherUserId,
            productId,
            content: newMessage,
            sender: user._id,
            createdAt: new Date().toISOString()
        };

        socket.emit('sendMessage', messageData);

        try {
            setNewMessage('');
            await dispatch(sendMessage(messageData)).unwrap();
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

    return (
        // Outermost container locked to exact screen height
        <div className="flex items-center justify-center w-full h-[100dvh] bg-[#050505] overflow-hidden sm:p-6 lg:p-10 relative z-0 selection:bg-blue-500/30 selection:text-blue-200">

            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-1/4 w-[40vw] h-[40vw] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] right-1/4 w-[30vw] h-[30vw] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            {/* Distinct Chat Panel (Box) */}
            <div className="flex flex-col w-full max-w-5xl h-full sm:h-[88vh] bg-[#0A0A0A]/90 backdrop-blur-3xl sm:rounded-[2.5rem] sm:border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative z-10 overflow-hidden mt-48">

                {/* Header (Fixed) */}
                <header className="flex-shrink-0 bg-gray-900/40 border-b border-gray-800/80 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2.5 bg-gray-800/50 hover:bg-gray-700 border border-gray-700/50 rounded-full text-gray-400 hover:text-white transition-all active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-gray-100 tracking-tight">Negotiation Room</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                                </span>
                                <p className="text-[10px] md:text-xs text-emerald-400 font-bold uppercase tracking-widest">Live Connection</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Chat Feed (Scrollable) min-h-0 prevents flex blowout */}
                <main className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar min-h-0">
                    {messages.length === 0 && !isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center bg-gray-900/30 p-8 rounded-3xl border border-gray-800/50">
                                <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                </div>
                                <p className="text-gray-400 text-sm font-medium tracking-wide">Start the conversation to negotiate the deal.</p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                        const isMe = senderId === user?._id;

                        return (
                            <div key={msg._id || index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                <div className={`relative max-w-[85%] md:max-w-[70%] px-5 py-3.5 rounded-[1.5rem] text-sm md:text-base ${isMe
                                    ? 'bg-blue-600 text-white rounded-br-sm shadow-[0_4px_20px_rgba(37,99,235,0.25)]'
                                    : 'bg-gray-800/60 text-gray-100 rounded-bl-sm border border-gray-700/50 shadow-sm backdrop-blur-sm'
                                    }`}>
                                    <p className="leading-relaxed font-medium break-words">{msg.content}</p>
                                    <div className={`text-[10px] mt-2 flex items-center gap-1.5 font-semibold tracking-wider ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
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
                <footer className="flex-shrink-0 bg-gray-900/40 border-t border-gray-800/80 p-4 sm:p-6 z-20">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-800/30 p-1.5 pl-6 rounded-2xl border border-gray-700/50 focus-within:border-blue-500/50 focus-within:bg-gray-800/50 transition-all shadow-inner">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-grow bg-transparent border-none focus:ring-0 text-gray-100 font-medium placeholder-gray-500 py-3 outline-none"
                            required
                        />

                        <button
                            disabled={isSending}
                            onClick={handleSendMessage}
                            className={`w-12 h-12 shrink-0 rounded-xl transition-all flex items-center justify-center ${isSending
                                ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]'
                                }`}
                        >
                            {isSending ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </form>
                    <p className="text-[10px] text-center text-gray-600 mt-3 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        End-to-End Encrypted
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default ChatRoom;