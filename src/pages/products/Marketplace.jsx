import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// ✨ NAYA: setPage ko import kiya hai
import { fetchProducts, setPage } from '../../features/products/productSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ProductSearch from '../../components/ProductSearch';
// ✨ NAYA: Pagination component import kiya hai
import Pagination from '../../components/Pagination';

const Marketplace = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ✨ NAYA: Redux se currentPage aur totalPages nikaala
    const { items = [], isLoading, error, currentPage = 1, totalPages = 1 } = useSelector((state) => state.products || {});
    const cartItems = useSelector((state) => state.cart?.items || state.cart?.cartItems || []);

    // ✨ NAYA: Effect ab currentPage badalne par API call karega
    useEffect(() => {
        dispatch(fetchProducts({ page: currentPage, limit: 12 }));

        // Page change hone par thoda smooth scroll top par
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dispatch, currentPage]);

    const handleAddToCart = (product) => {
        const alreadyInCart = cartItems?.find(item => item._id === product._id);

        if (alreadyInCart) {
            navigate('/cart');
            return;
        }
        dispatch(addToCart(product));

        Swal.fire({
            icon: 'success',
            title: 'Added to Interests!',
            text: `"${product.title}" has been saved.`,
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

    // ✨ NAYA: Page change handle karne ka function
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            dispatch(setPage(newPage));
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] pb-20 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-x-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="fixed top-0 w-full z-40 bg-[#050505]/80 backdrop-blur-2xl border-b border-gray-800/50 px-4 sm:px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 sm:p-2.5 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 rounded-full text-gray-400 hover:text-white transition-all active:scale-95"
                        >
                            <svg className="w-4 h-4 sm:w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-lg sm:text-2xl font-black text-gray-100 tracking-tight hidden xs:block">Marketplace</h1>
                    </div>

                    <div className="flex-grow max-w-2xl transition-all duration-300">
                        <ProductSearch />
                    </div>

                    <div className="shrink-0">
                        <button
                            onClick={() => navigate('/cart')}
                            className="relative p-2.5 sm:p-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)] active:scale-95 group"
                        >
                            <svg className="w-5 h-5 sm:w-6 h-6 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {cartItems?.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-28 sm:mt-32 relative z-10">
                {error?.message && (
                    <div className="text-center text-red-400 font-bold p-6 bg-red-500/10 border border-red-500/20 rounded-3xl mb-10">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="h-[400px] bg-gray-900/40 border border-gray-800 rounded-3xl animate-pulse p-4">
                                <div className="h-44 bg-gray-800/50 rounded-2xl mb-4"></div>
                                <div className="h-6 bg-gray-800/50 rounded-lg w-3/4 mb-3"></div>
                                <div className="h-6 bg-gray-800/50 rounded-lg w-1/4 mb-4"></div>
                                <div className="h-4 bg-gray-800/50 rounded-lg w-full mb-2"></div>
                                <div className="h-4 bg-gray-800/50 rounded-lg w-5/6"></div>
                            </div>
                        ))}
                    </div>
                ) : items?.length > 0 ? (
                    <>
                        {/* Tumhara Original Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                            {items.map((product) => {
                                const isAdded = cartItems?.some(item => item._id === product._id);
                                return (
                                    <div key={product._id} className="group bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border border-gray-800 shadow-xl hover:border-gray-700 sm:hover:-translate-y-1.5 transition-all duration-500 overflow-hidden flex flex-col h-full">
                                        <div className="relative h-48 sm:h-56 overflow-hidden cursor-pointer border-b border-gray-800" onClick={() => navigate(`/product/${product._id}`)}>
                                            <img
                                                src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'}
                                                alt={product.title}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                                loading="lazy"
                                            />
                                            <div className="absolute top-3 left-3 bg-[#050505]/80 backdrop-blur-md border border-gray-700 px-3 py-1 rounded-full text-[9px] font-black text-gray-200 tracking-widest z-20 flex items-center gap-1.5 uppercase">
                                                <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                                {product.location || 'Online'}
                                            </div>
                                        </div>

                                        <div className="p-5 sm:p-6 flex flex-col flex-grow">
                                            <h3
                                                className="text-lg sm:text-xl font-bold text-gray-100 leading-tight line-clamp-2 tracking-tight group-hover:text-blue-400 transition-colors cursor-pointer mb-2"
                                                onClick={() => navigate(`/product/${product._id}`)}
                                            >
                                                {product.title}
                                            </h3>
                                            <span className="text-xl sm:text-2xl font-black text-blue-400 mb-3 inline-block">${product.price}</span>
                                            <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-5 font-medium flex-grow leading-relaxed">
                                                {product.description}
                                            </p>

                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className={`w-full py-3 sm:py-3.5 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 mt-auto text-sm sm:text-base
                                                    ${isAdded
                                                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                                        : 'bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white'
                                                    }`}
                                            >
                                                {isAdded ? (
                                                    <><svg className="w-4 h-4 sm:w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg> In Interest List</>
                                                ) : (
                                                    <><svg className="w-4 h-4 sm:w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg> Add to Interests</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ✨ NAYA: Pagination Component Integration ✨ */}
                        {!isLoading && totalPages > 1 && (
                            <div className="mt-12 mb-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 sm:py-32 bg-gray-900/40 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem] border border-gray-800">
                        <div className="w-16 h-16 sm:w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700 text-gray-600">
                            <svg className="w-8 h-8 sm:w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <p className="text-gray-300 font-bold text-xl sm:text-2xl tracking-tight">Marketplace is empty</p>
                        <p className="text-gray-500 mt-2 font-medium px-4">No products match your search. Try different keywords!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;