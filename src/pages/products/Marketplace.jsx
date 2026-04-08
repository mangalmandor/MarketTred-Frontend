import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../features/products/productSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ProductSearch from '../../components/ProductSearch'

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { items = [], isLoading, error } = useSelector((state) => state.products || {});
    const cartItems = useSelector((state) => state.cart?.items || state.cart?.cartItems || []);

    useEffect(() => {
        if (items.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch]);

    useEffect(() => {
        // console.log("🛒 CURRENT CART STATE:", cartItems);
    }, [cartItems]);


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

    return (
        <div className="min-h-screen bg-[#050505] pb-20 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-x-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="fixed top-0 w-full z-40 bg-[#050505]/80 backdrop-blur-2xl border-b border-gray-800/50 px-6 py-4 transition-all">
                <div className="max-w-7xl mx-auto flex items-center justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 rounded-full text-gray-400 hover:text-white transition-all active:scale-95">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </button>
                        <h1 className="text-2xl font-black text-gray-100 tracking-tight">Marketplace</h1>
                    </div>

                    <div className="w-7xl mt-1">
                        <ProductSearch />
                    </div>

                    <button onClick={() => navigate('/cart')} className="relative p-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95 group">
                        <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        {cartItems?.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                                {cartItems.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-32 relative z-10">
                {error && (
                    <div className="text-center text-red-400 font-bold p-8 bg-red-500/10 border border-red-500/20 rounded-3xl mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="h-[420px] bg-gray-900/40 border border-gray-800 rounded-3xl animate-pulse p-4">
                                <div className="h-48 bg-gray-800/50 rounded-2xl mb-4"></div>
                                <div className="h-6 bg-gray-800/50 rounded-lg w-3/4 mb-3"></div>
                                <div className="h-6 bg-gray-800/50 rounded-lg w-1/4 mb-4"></div>
                                <div className="h-4 bg-gray-800/50 rounded-lg w-full mb-2"></div>
                                <div className="h-4 bg-gray-800/50 rounded-lg w-5/6"></div>
                            </div>
                        ))}
                    </div>
                ) : items?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {items.map((product) => {
                            const isAdded = cartItems?.some(item => item._id === product._id);

                            return (
                                <div key={product._id || Math.random()} className="group bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-gray-700 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden flex flex-col h-full">
                                    <div className="relative h-56 overflow-hidden cursor-pointer border-b border-gray-800" onClick={() => { navigate(`/product/${product._id}`) }}>
                                        <div className="absolute inset-0 bg-gray-800/50 animate-pulse"></div>
                                        <img
                                            src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'}
                                            alt={product.title}
                                            className="w-full h-full object-cover relative z-10 transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-4 left-4 bg-[#050505]/80 backdrop-blur-md border border-gray-700 px-3.5 py-1.5 rounded-full text-[10px] font-black text-gray-200 shadow-xl uppercase tracking-widest z-20 flex items-center gap-1.5">
                                            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            {product.location || 'Online'}
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-3 gap-2">
                                            <h3 className="text-xl font-bold text-gray-100 leading-tight line-clamp-2 tracking-tight group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => { navigate(`/product/${product._id}`) }}>{product.title}</h3>
                                        </div>
                                        <span className="text-2xl font-black text-blue-400 mb-4 inline-block">${product.price}</span>

                                        <p className="text-gray-500 text-sm line-clamp-2 mb-6 font-medium flex-grow leading-relaxed">
                                            {product.description}
                                        </p>

                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className={`w-full py-3.5 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 mt-auto
                                                ${isAdded
                                                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                                    : 'bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                                                }`}
                                        >
                                            {isAdded ? (
                                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg> In Interest List</>
                                            ) : (
                                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg> Add to Interests</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-gray-900/40 backdrop-blur-xl rounded-[3rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <p className="text-gray-300 font-bold text-2xl tracking-tight">Marketplace is empty</p>
                        <p className="text-gray-500 mt-2 font-medium">No products are currently available. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;

// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchProducts } from '../../features/products/productSlice';
// import { addToCart } from '../../features/cart/cartSlice';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import ProductSearch from '../../components/ProductSearch';

// const Marketplace = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     // Redux is now the only source of truth for the product list
//     const { items = [], isLoading, error } = useSelector((state) => state.products || {});
//     const cartItems = useSelector((state) => state.cart?.items || state.cart?.cartItems || []);

//     useEffect(() => {
//         dispatch(fetchProducts());
//     }, [dispatch]);

//     const handleAddToCart = (product) => {
//         const alreadyInCart = cartItems?.find(item => item._id === product._id);

//         if (alreadyInCart) {
//             navigate('/cart');
//             return;
//         }
//         dispatch(addToCart(product));

//         Swal.fire({
//             icon: 'success',
//             title: 'Added to Interests!',
//             text: `"${product.title}" has been saved.`,
//             background: '#111827',
//             color: '#f3f4f6',
//             showConfirmButton: false,
//             timer: 1500,
//             toast: true,
//             position: 'bottom-end',
//             customClass: {
//                 popup: 'border border-gray-800 rounded-xl shadow-2xl',
//             }
//         });
//     };

//     return (
//         <div className="min-h-screen bg-[#050505] pb-20 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-x-hidden">
//             <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
//             <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

//             <div className="fixed top-0 w-full z-40 bg-[#050505]/80 backdrop-blur-2xl border-b border-gray-800/50 px-6 py-4 transition-all">
//                 <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
//                     <div className="flex items-center gap-4 shrink-0">
//                         <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 rounded-full text-gray-400 hover:text-white transition-all active:scale-95">
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
//                         </button>
//                         <h1 className="text-2xl font-black text-gray-100 tracking-tight hidden md:block">Marketplace</h1>
//                     </div>

//                     {/* Fixed Search Bar Layout */}
//                     <div className="flex-grow max-w-2xl mx-auto">
//                         <ProductSearch />
//                     </div>

//                     <div className="shrink-0">
//                         <button onClick={() => navigate('/cart')} className="relative p-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95 group">
//                             <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
//                             {cartItems?.length > 0 && (
//                                 <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(239,68,68,0.5)]">
//                                     {cartItems.length}
//                                 </span>
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div className="max-w-7xl mx-auto px-6 mt-32 relative z-10">
//                 {error && (
//                     <div className="text-center text-red-400 font-bold p-8 bg-red-500/10 border border-red-500/20 rounded-3xl mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
//                         {error}
//                     </div>
//                 )}

//                 {isLoading ? (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//                         {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
//                             <div key={n} className="h-[420px] bg-gray-900/40 border border-gray-800 rounded-3xl animate-pulse p-4">
//                                 <div className="h-48 bg-gray-800/50 rounded-2xl mb-4"></div>
//                                 <div className="h-6 bg-gray-800/50 rounded-lg w-3/4 mb-3"></div>
//                                 <div className="h-6 bg-gray-800/50 rounded-lg w-1/4 mb-4"></div>
//                                 <div className="h-4 bg-gray-800/50 rounded-lg w-full mb-2"></div>
//                                 <div className="h-4 bg-gray-800/50 rounded-lg w-5/6"></div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : items?.length > 0 ? (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//                         {items.map((product) => {
//                             const isAdded = cartItems?.some(item => item._id === product._id);

//                             return (
//                                 <div key={product._id || Math.random()} className="group bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-gray-700 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden flex flex-col h-full">
//                                     <div className="relative h-56 overflow-hidden cursor-pointer border-b border-gray-800" onClick={() => { navigate(`/product/${product._id}`) }}>
//                                         <div className="absolute inset-0 bg-gray-800/50 animate-pulse"></div>
//                                         <img
//                                             src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'}
//                                             alt={product.title}
//                                             className="w-full h-full object-cover relative z-10 transform group-hover:scale-110 transition-transform duration-700 ease-out"
//                                             loading="lazy"
//                                         />
//                                         <div className="absolute top-4 left-4 bg-[#050505]/80 backdrop-blur-md border border-gray-700 px-3.5 py-1.5 rounded-full text-[10px] font-black text-gray-200 shadow-xl uppercase tracking-widest z-20 flex items-center gap-1.5">
//                                             <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
//                                             {product.location || 'Online'}
//                                         </div>
//                                     </div>

//                                     <div className="p-6 flex flex-col flex-grow">
//                                         <div className="flex justify-between items-start mb-3 gap-2">
//                                             <h3 className="text-xl font-bold text-gray-100 leading-tight line-clamp-2 tracking-tight group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => { navigate(`/product/${product._id}`) }}>{product.title}</h3>
//                                         </div>
//                                         <span className="text-2xl font-black text-blue-400 mb-4 inline-block">${product.price}</span>

//                                         <p className="text-gray-500 text-sm line-clamp-2 mb-6 font-medium flex-grow leading-relaxed">
//                                             {product.description}
//                                         </p>

//                                         <button
//                                             onClick={() => handleAddToCart(product)}
//                                             className={`w-full py-3.5 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 mt-auto
//                                                 ${isAdded
//                                                     ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
//                                                     : 'bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]'
//                                                 }`}
//                                         >
//                                             {isAdded ? (
//                                                 <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg> In Interest List</>
//                                             ) : (
//                                                 <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg> Add to Interests</>
//                                             )}
//                                         </button>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 ) : (
//                     <div className="text-center py-32 bg-gray-900/40 backdrop-blur-xl rounded-[3rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
//                         <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
//                             <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
//                         </div>
//                         <p className="text-gray-300 font-bold text-2xl tracking-tight">Marketplace is empty</p>
//                         <p className="text-gray-500 mt-2 font-medium">No products are currently available. Check back soon!</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Marketplace;

