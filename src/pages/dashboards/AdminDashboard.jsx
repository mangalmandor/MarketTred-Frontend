import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authSlice';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'System Logout',
            text: 'Are you sure you want to exit the Admin Control Center?',
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
                navigate('/');
            } catch (error) {
                console.error('Logout failed', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] p-6 lg:p-10 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-100 tracking-tight">Admin Control Center</h1>
                        <p className="text-gray-400 mt-1 font-medium">Welcome back, <span className="text-blue-400">{user?.name}</span>. Here is what's happening today.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2.5 bg-transparent border border-red-500/50 text-red-400 font-bold rounded-xl hover:bg-red-500/10 hover:border-red-500 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Log Out
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Users', value: '12,450', color: 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' },
                        { label: 'Active Sellers', value: '842', color: 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' },
                        { label: 'Total Products', value: '45,912', color: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' },
                        { label: 'Reported Issues', value: '3', color: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-6 border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
                            <div className={`w-2.5 h-12 rounded-full ${stat.color}`}></div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-100 mt-1">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-[500px] flex flex-col">
                        <h2 className="text-xl font-black text-gray-100 mb-6 tracking-tight">Recent User Registrations</h2>
                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800 hover:border-blue-500/30 rounded-2xl transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center font-black text-gray-400 group-hover:text-blue-400 transition-colors shadow-inner">
                                            U
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors">New User {i + 1}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">user{i}@example.com</p>
                                        </div>
                                    </div>
                                    <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold tracking-wide">
                                        Verified
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-[500px] flex flex-col">
                        <h2 className="text-xl font-black text-gray-100 mb-6 tracking-tight">System Actions</h2>
                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-gray-800/40 border border-gray-700/50 font-bold text-gray-300 hover:bg-gray-800 hover:border-blue-500/30 hover:text-blue-400 transition-all group">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                    Manage Categories
                                </div>
                                <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                            <button className="w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-gray-800/40 border border-gray-700/50 font-bold text-gray-300 hover:bg-gray-800 hover:border-blue-500/30 hover:text-blue-400 transition-all group">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Review Reports
                                </div>
                                <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;