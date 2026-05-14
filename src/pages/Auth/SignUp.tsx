import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Input } from '../../components/Input';
import { UserPlus, Mail, Lock, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fullName = fd.get('fullName') as string;
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    const confirmPassword = fd.get('confirmPassword') as string;

    const newErrors: Record<string, string> = {};
    if (!fullName || fullName.trim().length < 2) newErrors.fullName = 'Please enter your full name.';
    if (!email || !email.includes('@')) newErrors.email = 'Please enter a valid email address.';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setErrors({ form: error.message });
      setLoading(false);
    } else {
      // If session is null, it means email confirmation is enabled
      setIsSuccess(true);
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {isSuccess ? 'Check Your Email' : 'Create Account'}
          </h1>
          <p className="text-text-secondary text-[13px] mt-1.5">
            {isSuccess ? 'We have sent a confirmation link to your inbox.' : 'Join the elite network of turf owners'}
          </p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          {isSuccess ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex flex-col items-center gap-3">
                <Mail className="w-8 h-8 text-brand-primary animate-bounce" />
                <p className="text-[13px] text-text-secondary text-center leading-relaxed">
                  To complete your registration, please click the link we've sent to your email address. 
                  <br />
                  <span className="font-bold text-text-primary">Once confirmed, you can sign in.</span>
                </p>
              </div>
              <Link 
                to="/signin" 
                className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-[13px] uppercase tracking-wider hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 flex items-center justify-center"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <form noValidate onSubmit={handleSignUp} className="space-y-4">
                {errors.form && (
                  <div className="p-3 rounded-lg bg-status-danger/5 border border-status-danger/10 text-status-danger text-[12px] font-bold text-center">
                    {errors.form}
                  </div>
                )}
                
                <Input 
                  name="fullName"
                  label="Full Name"
                  placeholder="Enter your name"
                  error={errors.fullName}
                  onChange={() => setErrors(prev => ({ ...prev, fullName: '' }))}
                  icon={<User className="w-4 h-4" />}
                />

                <Input 
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="admin@linkqs.com"
                  error={errors.email}
                  onChange={() => setErrors(prev => ({ ...prev, email: '' }))}
                  icon={<Mail className="w-4 h-4" />}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password}
                    onChange={() => setErrors(prev => ({ ...prev, password: '' }))}
                    icon={<Lock className="w-4 h-4" />}
                  />
                  <Input 
                    name="confirmPassword"
                    label="Confirm"
                    type="password"
                    placeholder="••••••••"
                    error={errors.confirmPassword}
                    onChange={() => setErrors(prev => ({ ...prev, confirmPassword: '' }))}
                    icon={<Lock className="w-4 h-4" />}
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-[13px] uppercase tracking-wider hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  {loading ? 'Processing...' : 'Create Account'}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="px-3 bg-bg-primary text-text-muted">Or join with</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleSignUp}
                className="w-full bg-white border border-border-light text-text-primary py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-3 hover:bg-bg-secondary transition-all active:scale-[0.98]"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Sign up with Google
              </button>

              <p className="text-center text-[12px] text-text-secondary">
                Already have an account? {' '}
                <Link to="/signin" className="text-brand-primary font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
