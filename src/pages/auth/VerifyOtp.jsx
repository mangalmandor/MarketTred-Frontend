import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp } from '../../features/auth/authSlice';
import Swal from 'sweetalert2';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = location.state?.email || '';
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await dispatch(verifyOtp({ name, email, password, otp })).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'Account Verified!',
        text: 'Your registration is complete. Please log in.',
        background: '#111827',
        color: '#f3f4f6',
        confirmButtonColor: '#2563eb',
        customClass: {
          popup: 'border border-gray-800 rounded-2xl shadow-2xl',
        }
      });

      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Invalid OTP or registration failed.';
      setError(errorMessage);

      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: errorMessage,
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
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

      <form onSubmit={handleVerify} className="bg-gray-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md flex flex-col gap-6 relative">
        <div className="text-center mb-2">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(37,99,235,0.2)] mb-6 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-100 tracking-tight">Verify Identity</h2>
          <p className="text-gray-400 mt-2 font-medium">Enter your details and the 6-digit OTP</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm border border-red-500/20 text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={email}
            disabled
            className="w-full px-5 py-4 bg-gray-800/50 border border-gray-800 text-gray-500 rounded-xl cursor-not-allowed transition-all"
          />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <input
            type="text"
            placeholder="6-Digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full px-5 py-4 bg-gray-900/50 border border-gray-800 text-gray-100 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-center tracking-[0.5em] text-lg font-bold"
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
              Verifying...
            </>
          ) : (
            'Complete Registration'
          )}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;