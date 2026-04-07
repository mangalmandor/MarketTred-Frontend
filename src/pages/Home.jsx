import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] font-sans overflow-hidden selection:bg-blue-500/30 selection:text-blue-200 relative z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-[#050505]/80 border-b border-gray-800/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-all duration-300">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-gray-100">
                            Market<span className="text-blue-500">Chat</span>
                        </span>
                    </div>

                   <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:block px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 rounded-full transition-all"
                        >
                            Sign in
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 flex flex-col items-center justify-center text-center px-6 min-h-[90vh]">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gray-900/50 border border-gray-800 shadow-sm backdrop-blur-md text-blue-400 font-semibold text-xs uppercase tracking-wider mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Join thousands of active traders
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-gray-100 tracking-tighter mb-8 max-w-5xl leading-[1.1]">
                    The fastest way to <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500">
                        buy, sell, and connect.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-medium">
                    Negotiate securely in real-time with zero friction. Connect with verified buyers and sellers instantly through our lightning-fast marketplace.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => navigate('/register')}
                        className="px-10 py-4 text-base font-bold text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:-translate-y-1 active:scale-95"
                    >
                        Create an Account
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-10 py-4 text-base font-bold text-gray-200 bg-gray-900 border border-gray-700 rounded-full hover:bg-gray-800 hover:border-gray-600 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        Already have an account
                    </button>
                </div>
            </main>

            <section className="max-w-7xl mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-gray-800 hover:bg-gray-800/50 hover:border-gray-700 hover:-translate-y-2 transition-all duration-500 group">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500 border border-blue-500/20">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-100 mb-4 tracking-tight">Real-Time Chat</h3>
                        <p className="text-gray-400 font-medium leading-relaxed">Instant messaging powered by advanced WebSockets. No refreshing, just seamless and continuous negotiation.</p>
                    </div>

                    <div className="bg-gray-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-gray-800 hover:bg-gray-800/50 hover:border-gray-700 hover:-translate-y-2 transition-all duration-500 group">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500 border border-indigo-500/20">
                            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-100 mb-4 tracking-tight">Secure Access</h3>
                        <p className="text-gray-400 font-medium leading-relaxed">PASETO-encrypted tokens and multi-layer verification ensure your account and transactions remain impenetrable.</p>
                    </div>

                    <div className="bg-gray-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-gray-800 hover:bg-gray-800/50 hover:border-gray-700 hover:-translate-y-2 transition-all duration-500 group">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500 border border-purple-500/20">
                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-100 mb-4 tracking-tight">Instant Trading</h3>
                        <p className="text-gray-400 font-medium leading-relaxed">Post items or make offers in seconds. Experience the most fluid and intuitive marketplace environment available.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
