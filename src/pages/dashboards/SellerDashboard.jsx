import { useEffect, useMemo } from 'react';
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
    const { conversations } = useSelector((state) => state.chat);
    const { items: allProducts = [], isLoading: productsLoading } = useSelector((state) => state.products);

    // Filter Seller's own products
    const myProducts = allProducts.filter(product =>
        (product.seller?._id || product.seller) === user?._id
    );

    // 👈 LIVE UPDATE LOGIC: useMemo forces React to re-calculate and re-render the list 
    // immediately whenever the Redux 'conversations' array changes.
    const validConversations = useMemo(() => {
        return conversations.filter(c => c.product && c.buyer);
    }, [conversations]);
    // console.log(validConversations.length);

    const notificationCount = useMemo(() => {
        return conversations.filter(c => c.isUnread).length;
    }, [conversations]);

    useEffect(() => {
        dispatch(fetchAllConversations());
        dispatch(fetchProducts());

        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const onNewInquiry = (data) => {
            console.log("🔔 Socket Hit! Data received:", data);

            // Khud ke messages par bell/notification mat bajao
            if (data.sender?._id === user?._id || data.sender === user?._id) return;

            // Ye dispatch chatSlice ko hit karega aur naya array banayega
            dispatch(handleNewInquiry(data));

            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(() => console.log("Autoplay blocked"));

            if ("Notification" in window && Notification.permission === "granted") {
                const senderName = data.buyer?.name || "Buyer";
                new Notification(`New Message from ${senderName}`, {
                    body: data.content || "New inquiry received!",
                    icon: "/favicon.ico",
                });
            }
        };

        if (socket) {
            socket.on('new_inquiry', onNewInquiry);
        }

        return () => {
            if (socket) socket.off('new_inquiry', onNewInquiry);
        };
        // 👈 Added user?._id to dependencies so the "self-message" check never uses stale data
    }, [dispatch, socket, user?._id]);
    useEffect(() => {
        // Check karo: Kya Redux list mein aisi koi chat hai jisme product ki image ya title nahi hai?
        // (Aisa tabhi hota hai jab socket se ekdum nayi chat aati hai)
        const hasIncompleteChat = conversations.some(c =>
            typeof c.product === 'string' || !c.product?.image || !c.product?.title
        );

        // Agar incomplete chat mili, toh chupke se background mein API call karke photo/title mangwa lo
        if (hasIncompleteChat) {
            dispatch(fetchAllConversations());
        }
    }, [conversations, dispatch]);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Ready to leave?',
            text: 'You will be logged out of your Seller Account.',
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
            try {
                await dispatch(logoutUser()).unwrap();
                await Swal.fire({
                    title: 'Successfully Logged Out',
                    icon: 'success',
                    background: '#111827',
                    color: '#f3f4f6',
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'border border-gray-800 rounded-2xl shadow-2xl',
                    }
                });
                navigate('/')
            } catch (error) {
                console.error('Logout failed', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to log out. Please try again.',
                    icon: 'error',
                    background: '#111827',
                    color: '#f3f4f6',
                    confirmButtonColor: '#ef4444',
                    customClass: {
                        popup: 'border border-gray-800 rounded-2xl shadow-2xl',
                    }
                });
            }
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
        <div className="min-h-screen bg-[#050505] p-4 sm:p-6 lg:p-10 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-x-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-6">
                    <div className="max-w-[80%]">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-100 tracking-tight">Seller Hub</h1>
                        <p className="text-gray-400 mt-1 font-medium text-sm sm:text-base line-clamp-1">Manage your shop, <span className="text-blue-400">{user?.name}</span>.</p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
                        <div
                            className="relative cursor-pointer group flex-shrink-0"
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
                            <div className={`p-2.5 sm:p-3 rounded-xl transition-all border ${notificationCount > 0 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:text-gray-300'}`}>
                                <svg className={`w-5 h-5 sm:w-6 h-6 ${notificationCount > 0 ? 'animate-wiggle' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                </svg>
                            </div>
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-[#050505]">
                                    {notificationCount}
                                </span>
                            )}
                        </div>
                        <button onClick={() => navigate('/dashboard/seller/add-product')} className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white text-sm sm:text-base font-bold rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95 whitespace-nowrap">
                            Add Product
                        </button>
                        <button onClick={handleLogout} className="px-4 sm:px-6 py-2 sm:py-2.5 bg-transparent border border-red-500/50 text-red-400 text-sm sm:text-base font-bold rounded-xl hover:bg-red-500/10 transition-all active:scale-95 whitespace-nowrap">
                            Log Out
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-h-[400px] lg:h-[600px] flex flex-col">
                            <h2 className="text-lg sm:text-xl font-black text-gray-100 mb-6 tracking-tight">Your Live Products</h2>
                            <div className="overflow-y-auto pr-1 sm:pr-2 flex-grow custom-scrollbar">
                                {productsLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        {[1, 2, 3, 4].map(n => (
                                            <div key={n} className="bg-gray-800/30 rounded-2xl p-4 border border-gray-800 animate-pulse">
                                                <div className="w-full h-32 sm:h-40 bg-gray-700/50 rounded-xl mb-3"></div>
                                                <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                                                <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : myProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4">
                                        {myProducts.map(product => (
                                            <div key={product._id} className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/50 hover:bg-gray-800 hover:border-blue-500/30 cursor-pointer transition-all group" onClick={() => navigate(`/product/${product._id}`)}>
                                                <div className="overflow-hidden rounded-xl mb-3 aspect-video sm:aspect-auto">
                                                    <img src={product.image} className="w-full h-32 sm:h-40 object-cover transform group-hover:scale-105 transition-transform duration-500" alt="p" />
                                                </div>
                                                <h3 className="font-bold text-gray-100 truncate text-sm sm:text-base">{product.title}</h3>
                                                <p className="text-blue-400 font-black tracking-wide text-sm sm:text-base">${product.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl p-6">
                                        <svg className="w-10 h-10 sm:w-12 h-12 mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                        <p className="font-medium text-sm sm:text-base">No products listed yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div id="recent-chats" className="lg:col-span-1 order-1 lg:order-2 scroll-mt-6">
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-h-[300px] lg:h-[600px] flex flex-col lg:sticky lg:top-6">
                            <h3 className="text-lg sm:text-xl font-black text-gray-100 mb-6 flex items-center gap-2 tracking-tight">
                                <svg className="w-5 h-5 sm:w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                Buyer Messages
                            </h3>

                            <div className="flex-grow overflow-y-auto space-y-3 sm:space-y-4 pr-1 custom-scrollbar">
                                {validConversations.length > 0 ? (
                                    validConversations.map((chat) => (
                                        <div
                                            key={`${chat.product?._id}-${chat.buyer?._id}`}
                                            onClick={() => goToChat(chat.buyer, chat.product)}
                                            className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer relative group ${chat.isUnread
                                                ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                                                : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800 hover:border-blue-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                <img src={chat.product?.image} className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl object-cover border border-gray-700 shadow-sm" alt="p" />
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="text-xs sm:text-sm font-bold text-gray-100 truncate pr-4">{chat.product?.title}</h4>
                                                    <p className="text-[10px] sm:text-xs text-blue-400 font-bold truncate mt-0.5">Buyer: <span className="text-gray-300 font-semibold">{chat.buyer?.name}</span></p>
                                                    <p className="text-[10px] sm:text-[11px] text-gray-500 italic truncate mt-1">
                                                        {chat.lastMessage || "New negotiation..."}
                                                    </p>
                                                </div>
                                            </div>
                                            {chat.isUnread && (
                                                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                                                    <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                        <svg className="w-8 h-8 text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                        <p className="text-gray-500 text-xs sm:text-sm font-medium">No new inquiries.</p>
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
