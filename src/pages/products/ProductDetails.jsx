import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductById } from '../../features/products/productSlice';
import { addToCart } from '../../features/cart/cartSlice';
import Swal from 'sweetalert2';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentProduct: product, isLoading } = useSelector((state) => state.products);
    const { items: cartItems = [] } = useSelector((state) => state.cart || {});
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchProductById(id));
    }, [dispatch, id]);

    const isInCart = cartItems.some(item => (item._id || item) === id);

    const handleAddToCart = () => {
        if (!user) {
            Swal.fire({
                icon: 'info',
                title: 'Login Required',
                text: 'Please sign in to save items to your interest list.',
                background: '#111827',
                color: '#f3f4f6',
                confirmButtonColor: '#2563eb',
                customClass: {
                    popup: 'border border-gray-800 rounded-2xl shadow-2xl',
                }
            });
            return navigate('/login');
        }
        dispatch(addToCart(product));

        Swal.fire({
            icon: 'success',
            title: 'Added!',
            text: 'Item added to your interest list.',
            background: '#111827',
            color: '#f3f4f6',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'bottom-end',
            customClass: {
                popup: 'border border-gray-800 rounded-xl shadow-2xl',
            }
        });
    };

    const handleBuyNow = () => {
        if (!user) {
            Swal.fire({
                icon: 'info',
                title: 'Login Required',
                text: 'Please sign in to negotiate with the seller.',
                background: '#111827',
                color: '#f3f4f6',
                confirmButtonColor: '#2563eb',
                customClass: {
                    popup: 'border border-gray-800 rounded-2xl shadow-2xl',
                }
            });
            return navigate('/login');
        }
        navigate(`/chat/${product.seller?._id || product.seller}/${product._id}`);
    };

    if (isLoading || !product) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative z-0">
                <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
                <div className="relative w-20 h-20 mb-4">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-400 font-bold tracking-widest uppercase text-sm">Loading Product...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] p-6 lg:p-20 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between relative z-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-gray-900/50 border border-gray-800 flex items-center justify-center group-hover:bg-gray-800 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    </div>
                    <span className="font-bold text-sm tracking-widest uppercase">Back to Market</span>
                </button>
            </div>

            <div className="max-w-6xl mx-auto bg-gray-900/40 backdrop-blur-2xl border border-gray-800 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden relative z-10 flex flex-col md:flex-row">

                <div className="md:w-1/2 relative bg-gray-900 border-r border-gray-800/50">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 opacity-60"></div>
                    <img
                        src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'}
                        alt={product.title}
                        className="w-full h-[400px] md:h-full object-cover"
                    />
                    <div className="absolute top-6 left-6 z-20">
                        <span className="bg-[#050505]/80 backdrop-blur-md border border-gray-700 px-4 py-2 rounded-full text-xs font-black text-blue-400 shadow-xl uppercase tracking-widest flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Live Listing
                        </span>
                    </div>
                </div>

                <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-blue-500 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg font-black tracking-widest uppercase text-[10px]">
                            {product.location || 'Global'}
                        </span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-black text-gray-100 mb-4 tracking-tight leading-tight">{product.title}</h1>

                    <div className="flex items-end gap-3 mb-8">
                        <span className="text-4xl font-black text-blue-400">${product.price}</span>
                        <span className="text-gray-500 font-bold mb-1">USD</span>
                    </div>

                    <div className="bg-gray-800/30 p-6 rounded-2xl mb-8 border border-gray-700/50">
                        <h3 className="font-black text-gray-300 mb-3 tracking-wide uppercase text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                            Description
                        </h3>
                        <p className="text-gray-400 leading-relaxed font-medium">{product.description || "No description provided for this item. Contact the seller for more details."}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                        <button
                            onClick={handleAddToCart}
                            disabled={isInCart}
                            className={`flex-1 py-4 px-6 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border-2 
                                ${isInCart
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-not-allowed'
                                    : 'bg-transparent border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white hover:bg-gray-800 active:scale-95'
                                }`}
                        >
                            {isInCart ? (
                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg> Saved to Interests</>
                            ) : (
                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg> Save to Interests</>
                            )}
                        </button>

                        <button
                            onClick={handleBuyNow}
                            className="flex-1 py-4 px-6 bg-blue-600 border-2 border-blue-600 text-white rounded-2xl font-black hover:bg-blue-500 hover:border-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                            Start Negotiation
                        </button>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-gray-500 font-bold uppercase tracking-widest border-t border-gray-800 pt-6">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center"><svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>
                            Verified Seller
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center"><svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" /></svg></span>
                            Secure Chat
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;