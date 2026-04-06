import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authSlice';
import { fetchAllConversations, handleNewInquiry, markAsRead } from '../../features/chat/chatSlice';
import { fetchProducts } from '../../features/products/productSlice';
import { socket } from '../../services/socket';
import Swal from 'sweetalert2';

const BuyerDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { items: cartItems = [] } = useSelector((state) => state.cart || {});
    const { conversations = [], isLoading: chatsLoading } = useSelector((state) => state.chat);

    useEffect(() => {
        dispatch(fetchAllConversations());

        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const onNewMessage = (data) => {
            dispatch(handleNewInquiry(data));

            try {
                const audio = new Audio('/notification-sound.mp3');
                audio.play().catch(() => console.log("Autoplay blocked"));
            } catch (err) { console.log(err); }

            if ("Notification" in window && Notification.permission === "granted") {
                const senderName = data.seller?.name || "Seller";
                new Notification(`New Message from ${senderName}`, {
                    body: data.lastMessage || data.content || "You have a new reply about your saved item!",
                });
            }
        };

        socket.on('new_inquiry', onNewMessage);
        return () => {
            socket.off('new_inquiry', onNewMessage);
        };
    }, [dispatch]);

    const notificationCount = conversations.filter(c => c.isUnread === true).length;

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Ready to leave?',
            text: 'You will be logged out of your Buyer Account.',
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
                navigate('/login');
            } catch (error) {
                console.error('Logout failed', error);
            }
        }
    };

    const goToChat = (seller, product) => {
        const sId = seller?._id || seller;
        const pId = product?._id || product;

        if (!sId || !pId) return;
        console.log(sId, pId);

        navigate(`/chat/${sId}/${pId}`);
    };

    return (
        // FIXED: Changed overflow-hidden to overflow-x-hidden
        <div className="min-h-screen bg-[#050505] p-6 lg:p-10 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="max-w-6xl mx-auto relative z-10 overflow-y-hidden">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-100 tracking-tight">Buyer Account</h1>
                        <p className="text-gray-400 mt-1 font-medium">Welcome back, <span className="text-blue-400">{user?.name}</span>.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div
                            className="relative cursor-pointer group"
                            onClick={() => {
                                const element = document.getElementById('active-negotiations');
                                if (element) {
                                    // Using block: 'start' ensures it scrolls to a clean position
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
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

                        <button
                            onClick={handleLogout}
                            className="px-6 py-2.5 bg-transparent border border-red-500/50 text-red-400 font-bold rounded-xl hover:bg-red-500/10 hover:border-red-500 transition-all active:scale-95"
                        >
                            Log Out
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col items-center text-center group">
                            <div className="w-24 h-24 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-3xl font-black mb-4 group-hover:scale-105 transition-transform duration-500">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h2 className="text-xl font-bold text-gray-100">{user?.name}</h2>
                            <p className="text-gray-500 mb-6 text-sm">{user?.email}</p>

                            <button onClick={() => navigate('/products/marketplace')} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95">
                                Go to Marketplace
                            </button>
                        </div>

                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] p-6 border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-2">
                            <button onClick={() => navigate('/cart')} className="text-left px-5 py-4 rounded-xl hover:bg-gray-800 font-bold text-gray-300 transition-colors flex items-center justify-between border border-transparent hover:border-gray-700">
                                <span>Saved Items</span>
                                {cartItems?.length > 0 && (
                                    <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]">{cartItems.length}</span>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    const element = document.getElementById('active-negotiations');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }}
                                className="text-left px-5 py-4 rounded-xl hover:bg-gray-800 font-bold text-gray-300 transition-colors flex items-center justify-between border border-transparent hover:border-gray-700"
                            >
                                <span>Active Chats</span>
                                {conversations?.length > 0 && (
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div id="active-negotiations" className="lg:col-span-2 space-y-8 scroll-mt-6">
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                            <h3 className="text-xl font-black text-gray-100 mb-6 tracking-tight">Active Negotiations</h3>
                            {conversations?.length > 0 ? (
                                <div className="space-y-4 custom-scrollbar max-h-[400px] overflow-y-auto pr-2">
                                    {conversations.map((chat) => (
                                        <div
                                            key={chat._id || `${chat.product?._id}-${chat.sender?._id}`}
                                            onClick={() => goToChat(chat.seller, chat.product)}
                                            className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all group ${chat.isUnread
                                                ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                                                : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800 hover:border-blue-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <img src={chat.product?.image} className="w-14 h-14 rounded-xl object-cover border border-gray-700 shadow-sm" alt="p" />
                                                <div>
                                                    <h4 className="font-bold text-gray-100 truncate max-w-[200px] sm:max-w-xs">{chat.product?.title}</h4>
                                                    <p className="text-sm text-gray-400 mt-0.5">Seller: <span className="text-blue-400 font-medium">{chat.seller?.name || "User"}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {chat.isUnread && (
                                                    <span className="relative flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                                                    </span>
                                                )}
                                                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors hidden sm:block">
                                                    Continue
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-800">
                                    <p className="text-gray-500 font-medium">{chatsLoading ? "Loading..." : "No active negotiations."}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                            <h3 className="text-xl font-black text-gray-100 mb-6 tracking-tight">Your Saved Items</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {cartItems?.length > 0 ? cartItems.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => { navigate(`/product/${item._id}`) }}
                                        className="min-w-[140px] bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800 hover:border-blue-500/30 p-3 rounded-2xl text-center cursor-pointer group transition-all"
                                    >
                                        <div className="relative overflow-hidden rounded-xl mb-3">
                                            <img src={item.image} className="w-full h-24 object-cover transform group-hover:scale-110 transition duration-500" alt={item.title} />
                                        </div>
                                        <p className="text-xs font-bold truncate text-gray-300 group-hover:text-blue-400 transition-colors px-1">{item.title}</p>
                                        <p className="text-[11px] text-blue-500 font-black mt-1.5 bg-blue-500/10 inline-block px-2.5 py-0.5 rounded-lg">${item.price}</p>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 text-sm italic py-4">No saved items found. Start exploring the marketplace!</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;