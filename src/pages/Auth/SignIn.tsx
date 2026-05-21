import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Input } from '../../components/Input';
import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;

    const newErrors: Record<string, string> = {};
    if (!email || !email.includes('@')) newErrors.email = 'Please enter a valid email address.';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let message = error.message;
      if (message === 'Email not confirmed') {
        message = 'Please confirm your email address before signing in. Check your inbox for the confirmation link.';
      }
      setErrors({ form: message });
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-bg-primary rounded-2xl shadow-premium border border-border-light overflow-hidden"
      >
        <div className="p-8 pb-6 text-center">
          <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-primary/20">
            <span className="text-white font-bold text-xl tracking-tight">L</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Welcome Back</h1>
          <p className="text-text-secondary text-[13px] mt-1.5">Sign in to manage your turf empire</p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          <form noValidate onSubmit={handleSignIn} className="space-y-4">
            {errors.form && (
              <div className="p-3 rounded-lg bg-status-danger/5 border border-status-danger/10 text-status-danger text-[12px] font-bold text-center">
                {errors.form}
              </div>
            )}
            
            <Input 
              name="email"
              label="Email Address"
              type="email"
              placeholder="admin@linkqs.com"
              error={errors.email}
              onChange={() => setErrors(prev => ({ ...prev, email: '' }))}
              icon={<Mail className="w-4 h-4" />}
            />

            <div className="space-y-1">
              <Input 
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password}
                onChange={() => setErrors(prev => ({ ...prev, password: '' }))}
                icon={<Lock className="w-4 h-4" />}
              />
              <div className="flex justify-end">
                <button type="button" className="text-[11px] font-bold text-brand-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-[13px] tracking-wider hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="px-3 bg-bg-primary text-text-muted">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-border-light text-text-primary py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-3 hover:bg-bg-secondary transition-all active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Sign in with Google
          </button>

          <p className="text-center text-[12px] text-text-secondary">
            Don't have an account? {' '}
            <Link to="/signup" className="text-brand-primary font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
