import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-blue-500/10 border border-slate-100 overflow-hidden"
      >
        <div className="p-10 text-center space-y-6">
          <div className="inline-flex p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/30">
            <GraduationCap size={40} />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lusangazi District</h1>
            <p className="text-slate-500 font-medium italic">Form One Registration System</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all group"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
            <p className="text-xs text-slate-400">
              Authorized personnel only. Access is monitored and logged.
            </p>
          </div>
        </div>
        
        <div className="bg-slate-900 p-6 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Ministry of Education - Zambia
          </p>
        </div>
      </motion.div>
    </div>
  );
};
