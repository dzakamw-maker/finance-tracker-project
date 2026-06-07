import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toasts, showToast, dismissToast } = useToast();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        showToast('Registrasi berhasil! Silakan cek email kamu atau langsung login.', 'success');
        setIsLogin(true); // Switch to login view after successful register
      }
    } catch (error) {
      showToast(error.message || 'Terjadi kesalahan saat autentikasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-3xl shadow-lg mx-auto mb-4">
            💸
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            My Money Tracker
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'Masuk ke akun kamu untuk melanjutkan' : 'Buat akun baru untuk mulai mengelola keuangan'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              placeholder="nama@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-white font-medium shadow-md transition-all ${
              loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg active:scale-[0.98]'
            }`}
          >
            {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium transition-colors hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            {isLogin 
              ? 'Belum punya akun? Daftar di sini' 
              : 'Sudah punya akun? Masuk di sini'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
