import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../features/products/productSlice';

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, isLoading, error } = useSelector((state) => state.products || {});

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-[#050505] p-6 lg:p-10 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-100 tracking-tight">Marketplace</h2>
                        <p className="text-gray-400 font-medium mt-1">Explore items listed by the community.</p>
                    </div>
                </header>

                {error && (
                    <div className="text-center text-red-400 font-bold p-8 bg-red-500/10 border border-red-500/20 rounded-3xl mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="h-[400px] bg-gray-900/40 border border-gray-800 rounded-[2rem] animate-pulse p-6">
                                <div className="h-6 bg-gray-800/50 rounded-lg w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-800/50 rounded-lg w-full mb-2"></div>
                                <div className="h-4 bg-gray-800/50 rounded-lg w-5/6 mb-6"></div>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="h-8 bg-gray-800/50 rounded-lg w-1/4"></div>
                                    <div className="h-4 bg-gray-800/50 rounded-lg w-1/4"></div>
                                </div>
                                <div className="h-12 bg-gray-800/50 rounded-xl w-full mt-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : items?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map((product) => (
                            <div key={product._id || Math.random()} className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-gray-700 hover:-translate-y-1.5 transition-all duration-500 flex flex-col p-6 group">
                                <h3 className="text-2xl font-bold text-gray-100 mb-3 tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">{product.title}</h3>

                                <p className="text-gray-500 mb-6 flex-grow line-clamp-3 leading-relaxed font-medium">
                                    {product.description || "No description provided."}
                                </p>

                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-3xl font-black text-blue-400 tracking-wide">${product.price}</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                                        {product.location || 'Global'}
                                    </span>
                                </div>

                                <button
                                    onClick={() => navigate(`/chat/${product.seller?._id || product.seller}/${product._id}`)}
                                    className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95 flex items-center justify-center gap-2 mt-auto"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                    Chat with Seller
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-gray-900/40 backdrop-blur-xl rounded-[3rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <p className="text-gray-300 font-bold text-2xl tracking-tight">Marketplace is empty</p>
                        <p className="text-gray-500 mt-2 font-medium">No products are currently available.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;