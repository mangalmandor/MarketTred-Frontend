import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../features/auth/authSlice';
import Swal from 'sweetalert2';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const loggedInUser = await dispatch(loginUser({ email, password })).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Welcome Back!',
                text: 'Logging you in securely...',
                background: '#111827',
                color: '#f3f4f6',
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    popup: 'border border-gray-800 rounded-2xl shadow-2xl',
                }
            });

            if (loggedInUser.role === 'admin') {
                navigate('/dashboard/admin');
            } else if (loggedInUser.role === 'seller') {
                navigate('/dashboard/seller');
            } else {
                navigate('/dashboard/buyer');
            }

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: err.response?.data?.error || 'Invalid email or password.',
                background: '#111827',
                color: '#f3f4f6',
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'border border-gray-800 rounded-2xl shadow-2xl',
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative z-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <form onSubmit={handleLogin} className="bg-gray-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md flex flex-col gap-6 relative">
                <div className="text-center mb-2">
                    <div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(37,99,235,0.2)] mb-6 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => navigate('/')}
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-gray-100 tracking-tight">Welcome Back</h2>
                    <p className="text-gray-400 mt-2 font-medium">Sign in to continue to MarketChat</p>
                </div>

                <div className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-900/50 border border-gray-800 text-gray-100 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        required
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-900/50 border border-gray-800 text-gray-100 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        required
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 mt-2
                    ${isLoading ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95'}`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </>
                    ) : (
                        'Login'
                    )}
                </button>

                <div className="text-center mt-2">
                    <span className="text-gray-500 text-sm font-medium">Don't have an account? </span>
                    <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="text-blue-400 hover:text-blue-300 font-bold text-sm transition-colors"
                    >
                        Create one
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;