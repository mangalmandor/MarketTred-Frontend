import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addProduct, updateProduct, deleteProduct, fetchProducts } from '../../features/products/productSlice';

const AddProduct = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoading, items: existingProducts = [] } = useSelector((state) => state.products || {});
    const { user } = useSelector((state) => state.auth || {});

    const [activeTab, setActiveTab] = useState('add');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const initialFormState = {
        title: '',
        description: '',
        price: '',
        location: '',
        image: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const myProducts = existingProducts.filter(
        (product) => product.seller?._id === user?._id || product.seller === user?._id
    );

    const resetForm = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setEditId(null);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (!(tab === 'add' && isEditing)) {
            resetForm();
        }
    };

    const handleEditClick = (product) => {
        setFormData({
            title: product.title,
            description: product.description,
            price: product.price,
            location: product.location,
            image: product.image
        });
        setIsEditing(true);
        setEditId(product._id);
        setActiveTab('add');
    };

    const handleDeleteClick = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            background: '#111827',
            color: '#f3f4f6',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Yes, delete it!',
            customClass: { popup: 'border border-gray-800 rounded-2xl shadow-2xl' }
        });

        if (result.isConfirmed) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Your product has been removed.',
                    background: '#111827',
                    color: '#f3f4f6',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Delete',
                    text: err.response?.data?.error || 'Something went wrong.',
                    background: '#111827',
                    color: '#f3f4f6',
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await dispatch(updateProduct({ id: editId, productData: formData })).unwrap();
                await Swal.fire({
                    icon: 'success',
                    title: 'Product Updated!',
                    text: 'Your changes are now live.',
                    background: '#111827',
                    color: '#f3f4f6',
                    confirmButtonColor: '#2563eb',
                    customClass: { popup: 'border border-gray-800 rounded-2xl shadow-2xl' }
                });
                setActiveTab('manage');
                resetForm();
            } else {
                await dispatch(addProduct(formData)).unwrap();
                await Swal.fire({
                    icon: 'success',
                    title: 'Product Listed!',
                    text: 'Your item is now live on the marketplace.',
                    background: '#111827',
                    color: '#f3f4f6',
                    confirmButtonColor: '#2563eb',
                    customClass: { popup: 'border border-gray-800 rounded-2xl shadow-2xl' }
                });
                navigate('/dashboard/seller');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: isEditing ? 'Update Failed' : 'Listing Failed',
                text: err.response?.data?.error || 'Please check your details.',
                background: '#111827',
                color: '#f3f4f6',
                confirmButtonColor: '#ef4444',
                customClass: { popup: 'border border-gray-800 rounded-2xl shadow-2xl' }
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] p-4 lg:p-10 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors mb-4 font-medium text-sm w-fit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Back to Dashboard
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-100 tracking-tight">Product Hub</h1>
                        <p className="text-gray-400 font-medium mt-1">Manage your store inventory seamlessly.</p>
                    </div>

                    <div className="bg-gray-900/60 p-1.5 rounded-2xl border border-gray-800 flex shadow-lg w-full md:w-auto">
                        <button onClick={() => handleTabChange('add')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'add' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
                            {isEditing ? 'Edit Listing' : 'Create Listing'}
                        </button>
                        <button onClick={() => handleTabChange('manage')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
                            Manage Inventory
                        </button>
                    </div>
                </div>

                <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden relative z-10 p-6 md:p-10">

                    {activeTab === 'add' && (
                        <div className="animate-fadeIn">
                            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                                <h2 className="text-xl font-bold text-gray-100">
                                    {isEditing ? 'Update Your Item' : 'Add a New Item'}
                                </h2>
                                {isEditing && (
                                    <button onClick={resetForm} className="text-sm text-red-400 hover:text-red-300 font-bold">
                                        Cancel Edit
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                                <div className="lg:col-span-3 space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-gray-300">Title</label>
                                        <input name="title" value={formData.title} required onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-5 py-4 bg-gray-900/50 border border-gray-800 text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="What are you selling?" disabled={isLoading} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-gray-300">Description</label>
                                        <textarea name="description" value={formData.description} required rows="5" onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-5 py-4 bg-gray-900/50 border border-gray-800 text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none resize-none custom-scrollbar" placeholder="Describe the item condition..." disabled={isLoading} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-gray-300">Price ($)</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold">$</span>
                                                <input name="price" value={formData.price} type="number" min="0" step="0.01" required onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full pl-9 pr-5 py-4 bg-gray-900/50 border border-gray-800 text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.00" disabled={isLoading} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-gray-300">Location</label>
                                            <input name="location" value={formData.location} required onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-5 py-4 bg-gray-900/50 border border-gray-800 text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="e.g. New York, NY" disabled={isLoading} />
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-gray-300">Image URL</label>
                                        <input name="image" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-5 py-4 bg-gray-900/50 border border-gray-800 text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="Paste a direct image link" disabled={isLoading} />
                                    </div>
                                    <div className="flex-1 w-full min-h-[200px] border-2 border-dashed border-gray-700 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-800/20">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL' }} />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-500">Live Image Preview</p>
                                        )}
                                    </div>
                                    <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex justify-center items-center gap-3 ${isLoading ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)]'}`}>
                                        {isLoading ? 'Processing...' : isEditing ? 'Update Listing' : 'Publish Listing'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'manage' && (
                        <div className="animate-fadeIn min-h-[400px]">
                            <h2 className="text-xl font-bold text-gray-100 mb-8 border-b border-gray-800 pb-4">Your Active Listings</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myProducts.length > 0 ? (
                                    myProducts.map((product) => (
                                        <div key={product._id} className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4 flex gap-4 group hover:bg-gray-800/60 transition-all">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-900 shrink-0">
                                                <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image' }} />
                                            </div>
                                            <div className="flex flex-col justify-between w-full overflow-hidden">
                                                <div>
                                                    <h3 className="text-gray-100 font-bold truncate">{product.title}</h3>
                                                    <p className="text-blue-400 font-black text-sm mt-0.5">${product.price}</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button onClick={() => handleEditClick(product)} className="text-xs bg-gray-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors font-bold shadow-sm">Edit</button>
                                                    <button onClick={() => handleDeleteClick(product._id)} className="text-xs border border-gray-600 hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 text-gray-400 px-3 py-1.5 rounded-lg transition-colors font-bold">Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10">
                                        <p className="text-gray-500">You haven't listed any products yet.</p>
                                    </div>
                                )}

                                <div className="border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center p-6 min-h-[120px] text-center text-gray-500 hover:border-gray-600 hover:text-gray-400 transition-colors cursor-pointer" onClick={() => handleTabChange('add')}>
                                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    <span className="font-bold text-sm">Add New Product</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`.animate-fadeIn { animation: fadeIn 0.4s ease-in-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default AddProduct;