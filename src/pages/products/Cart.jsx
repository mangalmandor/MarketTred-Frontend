import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart } from '../../features/cart/cartSlice';
import Swal from 'sweetalert2';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { items: cartItems = [] } = useSelector((state) => state.cart || {});

    const handleChat = (seller, productId) => {
        const sellerId = seller?._id || seller;
        if (!sellerId) {
            Swal.fire({
                icon: 'error',
                title: 'Cannot Start Chat',
                text: 'Seller details are missing for this product.',
                background: '#111827',
                color: '#f3f4f6',
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'border border-gray-800 rounded-2xl shadow-2xl',
                }
            });
            return;
        }
        navigate(`/chat/${sellerId}/${productId}`);
    };

    const handleRemove = (itemId, itemTitle) => {
        Swal.fire({
            title: 'Remove Item?',
            text: `Are you sure you want to remove "${itemTitle}" from your interest list?`,
            icon: 'warning',
            showCancelButton: true,
            background: '#111827',
            color: '#f3f4f6',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Yes, remove it',
            customClass: {
                popup: 'border border-gray-800 rounded-2xl shadow-2xl',
            }
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(removeFromCart(itemId));
                Swal.fire({
                    icon: 'success',
                    title: 'Removed!',
                    text: 'The item has been removed from your list.',
                    background: '#111827',
                    color: '#f3f4f6',
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'border border-gray-800 rounded-2xl shadow-2xl',
                    }
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-6 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2 cursor-pointer w-fit" onClick={() => navigate(-1)}>
                            <button className="p-2 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 rounded-full text-gray-400 hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest">Back</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-100 tracking-tight">My Interest List</h1>
                        <p className="text-gray-400 font-medium mt-2">Items you want to negotiate for.</p>
                    </div>
                    <span className="text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-5 py-2 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                        {cartItems?.length} Saved Items
                    </span>
                </header>

                {cartItems && cartItems?.length > 0 ? (
                    <div className="space-y-6">
                        {cartItems.map((item) => (
                            <div key={item?._id} className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col md:flex-row items-center gap-6 hover:bg-gray-800/50 hover:border-gray-700 transition-all duration-300 group">
                                <div className="relative overflow-hidden rounded-2xl shrink-0 border border-gray-700/50 group-hover:border-blue-500/30 transition-colors">
                                    <img
                                        src={item?.image || 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=1000'}
                                        alt={item?.title}
                                        className="w-full md:w-40 h-40 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                <div className="flex-1 text-center md:text-left w-full">
                                    <h3 className="text-2xl font-bold text-gray-100 tracking-tight mb-1">{item?.title}</h3>
                                    <p className="text-blue-400 font-black text-xl mb-2">${item?.price}</p>
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        <p className="text-sm font-medium">{item?.location || "Location not specified"}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                                    <button
                                        onClick={() => handleChat(item?.seller, item?._id)}
                                        className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                        Chat with Seller
                                    </button>
                                    <button
                                        onClick={() => handleRemove(item?._id, item?.title)}
                                        className="px-6 py-3.5 bg-transparent border border-red-500/50 text-red-400 font-bold rounded-xl hover:bg-red-500/10 hover:border-red-500 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-dashed border-gray-800 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </div>
                        <p className="text-gray-400 font-bold text-2xl tracking-tight">Your interest list is empty.</p>
                        <p className="text-gray-600 font-medium mt-2 max-w-md">Save items you like while browsing the marketplace to negotiate for them later.</p>
                        <button
                            onClick={() => navigate('/products/marketplace')}
                            className="mt-8 px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95"
                        >
                            Explore Marketplace
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;