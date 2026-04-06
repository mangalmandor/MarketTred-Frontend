import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../../services/socket';
import { fetchChatHistory, sendMessage, receiveMessage } from '../../features/chat/chatSlice';
import { fetchProductById } from '../../features/products/productSlice';
import Swal from 'sweetalert2';

const BuyerChatZone = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    const { user } = useSelector((state) => state.auth);
    const { messages } = useSelector((state) => state.chat);
    const { currentProduct, sellerInfo } = useSelector((state) => state.products);

    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        if (productId) {
            dispatch(fetchProductById(productId));
        }
    }, [dispatch, productId]);

    useEffect(() => {
        if (sellerInfo?._id && productId) {
            dispatch(fetchChatHistory({ otherUserId: sellerInfo._id, productId }));
            socket.emit('joinRoom', { userId: user?._id, otherUserId: sellerInfo._id, productId });
        }

        const handleMsg = (msg) => {
            if (msg.product === productId) {
                dispatch(receiveMessage(msg));
            }
        };

        socket.on('receiveMessage', handleMsg);
        return () => socket.off('receiveMessage', handleMsg);
    }, [dispatch, sellerInfo?._id, productId, user?._id]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !sellerInfo?._id) return;

        const payload = {
            receiverId: sellerInfo._id,
            productId,
            content: inputMessage
        };

        try {
            await dispatch(sendMessage(payload)).unwrap();
            socket.emit('sendMessage', { ...payload, sender: user._id });
            setInputMessage('');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Message Not Sent',
                text: 'Failed to deliver your message. Please check your connection.',
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
        <div className="flex flex-col h-[85vh] max-w-5xl mx-auto bg-gray-900/40 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800 relative z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="bg-gray-900/60 backdrop-blur-md p-4 flex items-center justify-between border-b border-gray-800 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="relative">
                        <img
                            src={currentProduct?.image || '/placeholder.png'}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-gray-700 shadow-sm"
                            alt="product"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-gray-900 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    </div>
                    <div>
                        <h2 className="text-base font-black text-gray-100 tracking-tight">{currentProduct?.title || "Loading..."}</h2>
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-0.5">
                            Seller: <span className="text-gray-300">{sellerInfo?.name || "Connecting..."}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl">
                    <div className="relative">
                        <svg className="w-5 h-5 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                    </div>
                    <span className="text-xs font-black text-blue-400 hidden md:block tracking-wide">Active</span>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
                {messages.map((msg, idx) => {
                    const isMe = msg.sender === user?._id;
                    return (
                        <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                            <div className={`relative max-w-[80%] px-5 py-3 rounded-2xl text-sm md:text-base transition-transform hover:scale-[1.02] ${isMe
                                ? 'bg-blue-600 text-white rounded-br-none shadow-[0_4px_20px_rgba(37,99,235,0.25)]'
                                : 'bg-gray-800/80 text-gray-100 rounded-bl-none border border-gray-700 shadow-sm backdrop-blur-sm'
                                }`}>
                                <p className="leading-relaxed font-medium">{msg.content}</p>
                                <div className={`text-[10px] mt-2 flex items-center gap-1.5 font-semibold tracking-wider ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            <div className="p-4 bg-gray-900/80 border-t border-gray-800 backdrop-blur-xl z-10">
                <form onSubmit={handleSend} className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-2xl border border-gray-700 focus-within:border-blue-500/50 focus-within:bg-gray-800 transition-all shadow-inner">
                    <button type="button" className="p-2 text-gray-500 hover:text-blue-400 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>

                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow bg-transparent border-none focus:ring-0 text-gray-100 font-medium placeholder-gray-500 py-2 outline-none"
                    />

                    <button
                        type="submit"
                        disabled={!inputMessage.trim()}
                        className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 disabled:opacity-30 disabled:bg-gray-700 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95 flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                </form>
                <p className="text-[10px] text-center text-gray-600 mt-3 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    End-to-End Encrypted
                </p>
            </div>
        </div>
    );
};

export default BuyerChatZone;