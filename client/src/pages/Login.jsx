import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      navigate('/');
      return;
    }

    const token = searchParams.get('token');
    if (token) {
      login({
        _id: searchParams.get('userId'),
        name: searchParams.get('name'),
        email: searchParams.get('email'),
        picture: searchParams.get('picture'),
        accessToken: token
      });
      navigate('/');
    } else if (searchParams.get('error')) {
      console.error('Authentication failed during redirect from backend');
    }
  }, [user, navigate, searchParams, login]);

  const handleGoogleLogin = async () => {
    try {
      // Typically we'd fetch the URL from the backend and redirect
      const response = await fetch('http://localhost:5000/api/auth/google');
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error fetching Google auth url', error);
      // Fallback mockup login for demo if backend is not setup
      login({ _id: 'mock123', name: 'Mock User', email: 'mock@gmail.com' });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d14] p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass p-12 rounded-3xl w-full max-w-md flex flex-col items-center relative z-10 border border-white/10 shadow-2xl">
        <div className="bg-blue-500/10 p-4 rounded-2xl mb-6">
          <ShieldCheck className="w-16 h-16 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          SpamShield
        </h1>
        <p className="text-gray-400 text-center mb-10">Advanced AI Email Protection</p>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
          Connect with Gmail
        </button>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Secure, read-only access to classify and protect your inbox.
        </p>
      </div>
    </div>
  );
}
