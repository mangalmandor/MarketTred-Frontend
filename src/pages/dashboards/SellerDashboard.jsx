import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authSlice';
import { fetchAllConversations, handleNewInquiry, markAsRead } from '../../features/chat/chatSlice';
import { fetchProducts } from '../../features/products/productSlice';
import { socket } from '../../services/socket';
import Swal from 'sweetalert2';

const SellerDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { conversations = [] } = useSelector((state) => state.chat);
    const { items: allProducts = [], isLoading: productsLoading } = useSelector((state) => state.products);

    const myProducts = allProducts.filter(product =>
        (product.seller?._id || product.seller) === user?._id
    );

    const validConversations = conversations.filter(c => c.product && c.buyer && c.product.image);
    const notificationCount = validConversations.filter(c => c.isUnread).length;

    useEffect(() => {
        dispatch(fetchAllConversations());
        dispatch(fetchProducts());

        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const onNewInquiry = (data) => {
            dispatch(handleNewInquiry(data));

            try {
                const audio = new Audio('/notification-sound.mp3');
                audio.play().catch(() => console.log("Autoplay blocked"));
            } catch (err) { console.log(err); }

            if ("Notification" in window && Notification.permission === "granted") {
                const senderName = data.buyer?.name || "Buyer";
                new Notification(`New Message from ${senderName}`, {
                    body: data.content || "New inquiry received!",
                    icon: "/favicon.ico",
                });
            }
        };

        socket.on('new_inquiry', onNewInquiry);
        return () => socket.off('new_inquiry', onNewInquiry);
    }, [dispatch]);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Ready to leave?',
            text: 'You will be logged out of your Seller Hub.',
            icon: 'warning',
            showCancelButton: true,
            background: '#111827',
            color: '#f3f4f6',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Yes, log out',
            customClass: {
                popup: 'border border-gray-800 rounded-2xl shadow-2xl',
            }
        });

        if (result.isConfirmed) {
            await dispatch(logoutUser()).unwrap();
            navigate('/');
        }
    };

    const goToChat = (buyerId, productId) => {
        const bId = buyerId?._id || buyerId;
        const pId = productId?._id || productId;
        if (!bId || !pId) return;

        dispatch(markAsRead({ productId: pId, buyerId: bId }));
        navigate(`/chat/${bId}/${pId}`);
    };

    return (
        <div className="min-h-screen bg-[#050505] p-6 lg:p-10 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="max-w-7xl mx-auto relative z-10 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-100 tracking-tight">Seller Account</h1>
                        <p className="text-gray-400 mt-1 font-medium">Manage your shop, <span className="text-blue-400">{user?.name}</span>.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div
                            className="relative cursor-pointer group"
                            onClick={() => document.getElementById('recent-chats')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <style>
                                {`@keyframes bell-wiggle {
                                    0%, 100% { transform: rotate(0deg); }
                                    20% { transform: rotate(-15deg); }
                                    40% { transform: rotate(15deg); }
                                    60% { transform: rotate(-10deg); }
                                    80% { transform: rotate(10deg); }
                                }
                                .animate-wiggle { animation: bell-wiggle 0.8s ease-in-out infinite; }`}
                            </style>
                            <div className={`p-3 rounded-xl transition-all border ${notificationCount > 0 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:text-gray-300'}`}>
                                <svg className={`w-6 h-6 ${notificationCount > 0 ? 'animate-wiggle' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                </svg>
                            </div>
                            {notificationCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                                    {notificationCount}
                                </span>
                            )}
                        </div>
                        <button onClick={() => navigate('/dashboard/seller/add-product')} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95">
                            Product Hub
                        </button>
                        <button onClick={handleLogout} className="px-6 py-2.5 bg-transparent border border-red-500/50 text-red-400 font-bold rounded-xl hover:bg-red-500/10 hover:border-red-500 transition-all active:scale-95">
                            Log Out
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-[600px] flex flex-col">
                            <h2 className="text-xl font-black text-gray-100 mb-6 tracking-tight">Your Live Products</h2>
                            <div className="overflow-y-auto pr-2 flex-grow custom-scrollbar">
                                {productsLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[1, 2, 3, 4].map(n => (
                                            <div key={n} className="bg-gray-800/30 rounded-2xl p-4 border border-gray-800 animate-pulse">
                                                <div className="w-full h-40 bg-gray-700/50 rounded-xl mb-3"></div>
                                                <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                                                <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : myProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                                        {myProducts.map(product => (
                                            <div key={product._id} className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/50 hover:bg-gray-800 hover:border-blue-500/30 cursor-pointer transition-all group" onClick={() => navigate(`/product/${product._id}`)}>
                                                <div className="overflow-hidden rounded-xl mb-3">
                                                    <img src={product.image} className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-500" alt="p" />
                                                </div>
                                                <h3 className="font-bold text-gray-100 truncate">{product.title}</h3>
                                                <p className="text-blue-400 font-black tracking-wide">${product.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl">
                                        <svg className="w-12 h-12 mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                        <p className="font-medium">No products listed yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div id="recent-chats" className="lg:col-span-1">
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] p-6 border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-[600px] flex flex-col sticky top-6">
                            <h3 className="text-xl font-black text-gray-100 mb-6 flex items-center gap-2 tracking-tight">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                Buyer Messages
                            </h3>

                            <div className="flex-grow overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                                {validConversations.length > 0 ? (
                                    validConversations.map((chat) => (
                                        <div
                                            key={`${chat.product?._id}-${chat.buyer?._id}`}
                                            onClick={() => goToChat(chat.buyer, chat.product)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${chat.isUnread
                                                ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                                                : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800 hover:border-blue-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <img src={chat.product?.image} className="w-14 h-14 rounded-xl object-cover border border-gray-700 shadow-sm" alt="p" />
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="text-sm font-bold text-gray-100 truncate">{chat.product?.title}</h4>
                                                    <p className="text-xs text-blue-400 font-bold truncate mt-0.5">Buyer: <span className="text-gray-300 font-semibold">{chat.buyer?.name}</span></p>
                                                    <p className="text-[11px] text-gray-500 italic truncate mt-1">
                                                        {chat.lastMessage || "New negotiation..."}
                                                    </p>
                                                </div>
                                            </div>
                                            {chat.isUnread && (
                                                <div className="absolute top-4 right-4">
                                                    <span className="relative flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                        <svg className="w-10 h-10 text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                        <p className="text-gray-500 text-sm font-medium">No new inquiries.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
