import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authSlice';
import { fetchAllConversations, handleNewInquiry, markAsRead } from '../../features/chat/chatSlice';
import { socket } from '../../services/socket';
import Swal from 'sweetalert2';

const BuyerDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { items: cartItems = [] } = useSelector((state) => state.cart || {});
    const { conversations = [], isLoading: chatsLoading } = useSelector((state) => state.chat);
    const notificationCount = conversations.filter(c => c.isUnread === true).length;

    useEffect(() => {
        if (conversations?.length === 0) {

            dispatch(fetchAllConversations());
        }

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

                navigate('/');
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

    const goToChat = (chat) => {
        // Teeno IDs direct chat dabe (box) se nikaalo
        const sId = chat.seller?._id || chat.seller;
        const pId = chat.product?._id || chat.product;
        const bId = chat.buyer?._id || chat.buyer; // 👈 Ye 100% Redux se match karegi

        if (!sId || !pId) return;

        // Ab Redux ko exact wahi ID do jo dabe mein hai
        dispatch(markAsRead({ productId: pId, buyerId: bId }));

        // Fir navigate karo
        navigate(`/chat/${sId}/${pId}`);
    };

    return (
        <div className="min-h-screen bg-[#050505] p-4 sm:p-6 lg:p-10 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-x-hidden">
            <div className="fixed top-[-10%] left-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            <div className="max-w-6xl mx-auto relative z-10">
                <header className="mb-8 flex flex-row items-center justify-between gap-4">
                    <div className="max-w-[60%]">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-100 tracking-tight">Buyer Account</h1>
                        <p className="text-gray-400 mt-1 font-medium text-sm sm:text-base line-clamp-1">Hello, <span className="text-blue-400">{user?.name}</span></p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <div
                            className="relative cursor-pointer group"
                            onClick={() => {
                                const element = document.getElementById('active-negotiations');
                                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

                        <button
                            onClick={handleLogout}
                            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-transparent border border-red-500/50 text-red-400 text-sm sm:text-base font-bold rounded-xl hover:bg-red-500/10 transition-all active:scale-95"
                        >
                            Log Out
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="space-y-6">
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-gray-800 flex flex-col items-center text-center group">
                            <div className="w-20 h-20 sm:w-24 h-24 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black mb-4 group-hover:scale-105 transition-transform duration-500">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-100 truncate w-full px-2">{user?.name}</h2>
                            <p className="text-gray-500 mb-6 text-xs sm:text-sm truncate w-full px-2">{user?.email}</p>

                            <button onClick={() => navigate('/products/marketplace')} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95 text-sm sm:text-base">
                                Go to Marketplace Hub
                            </button>
                        </div>

                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 border border-gray-800 flex flex-col gap-1 sm:gap-2">
                            <button onClick={() => navigate('/cart')} className="text-left px-4 py-3 sm:py-4 rounded-xl hover:bg-gray-800 font-bold text-gray-300 transition-colors flex items-center justify-between text-sm sm:text-base">
                                <span>Saved Items</span>
                                {cartItems?.length > 0 && (
                                    <span className="bg-blue-600 text-white text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full">{cartItems.length}</span>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    const element = document.getElementById('active-negotiations');
                                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="text-left px-4 py-3 sm:py-4 rounded-xl hover:bg-gray-800 font-bold text-gray-300 transition-colors flex items-center justify-between text-sm sm:text-base"
                            >
                                <span>Active Chats</span>
                                {conversations?.length > 0 && (
                                    <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div id="active-negotiations" className="lg:col-span-2 space-y-6 sm:space-y-8 scroll-mt-6">
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-gray-800">
                            <h3 className="text-lg sm:text-xl font-black text-gray-100 mb-6 tracking-tight">Active Negotiations</h3>
                            {conversations?.length > 0 ? (
                                <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                                    {conversations.map((chat) => (
                                        <div
                                            key={chat._id || `${chat.product?._id}-${chat.sender?._id}`}
                                            onClick={() => goToChat(chat)}
                                            className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all group ${chat.isUnread
                                                ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                                                : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800 hover:border-blue-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                                                <img src={chat.product?.image} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-gray-700" alt="p" />
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-gray-100 text-sm sm:text-base truncate pr-2">{chat.product?.title}</h4>
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate">Seller: <span className="text-blue-400 font-medium">{chat.seller?.name || "User"}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 ml-2">
                                                {chat.isUnread && (
                                                    <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
                                                    </span>
                                                )}
                                                <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 sm:py-12 bg-gray-800/30 rounded-2xl border border-gray-800">
                                    <p className="text-gray-500 text-sm sm:text-base font-medium">{chatsLoading ? "Loading..." : "No active negotiations."}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-gray-800">
                            <h3 className="text-lg sm:text-xl font-black text-gray-100 mb-6 tracking-tight">Your Saved Items</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                                {cartItems?.length > 0 ? cartItems.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => { navigate(`/product/${item._id}`) }}
                                        className="min-w-[130px] sm:min-w-[140px] bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800 hover:border-blue-500/30 p-3 rounded-2xl text-center cursor-pointer group transition-all snap-start"
                                    >
                                        <div className="relative overflow-hidden rounded-xl mb-3 h-20 sm:h-24">
                                            <img src={item.image} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" alt={item.title} />
                                        </div>
                                        <p className="text-[10px] sm:text-xs font-bold truncate text-gray-300 group-hover:text-blue-400 transition-colors px-1">{item.title}</p>
                                        <p className="text-[10px] sm:text-[11px] text-blue-500 font-black mt-1.5 bg-blue-500/10 inline-block px-2.5 py-0.5 rounded-lg">${item.price}</p>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 text-xs sm:text-sm italic py-4">No saved items found.</p>
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
