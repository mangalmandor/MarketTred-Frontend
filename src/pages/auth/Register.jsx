import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../features/auth/authSlice';
import Swal from 'sweetalert2';

const Register = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await dispatch(registerUser(email)).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: 'Please check your email for the verification code.',
        background: '#111827',
        color: '#f3f4f6',
        confirmButtonColor: '#2563eb',
        customClass: {
          popup: 'border border-gray-800 rounded-2xl shadow-2xl',
        }
      });

      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.error || 'Something went wrong. Please try again.',
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

      <form onSubmit={handleRegister} className="bg-gray-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md flex flex-col gap-6 relative">
        <div className="text-center mb-2">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(37,99,235,0.2)] mb-6 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-100 tracking-tight">Create Account</h2>
          <p className="text-gray-400 mt-2 font-medium">Enter your email to get started</p>
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
              Sending OTP...
            </>
          ) : (
            'Send OTP'
          )}
        </button>

        <div className="text-center mt-2">
          <span className="text-gray-500 text-sm font-medium">Already have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-400 hover:text-blue-300 font-bold text-sm transition-colors"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;