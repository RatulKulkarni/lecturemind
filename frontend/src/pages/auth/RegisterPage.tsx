import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSparkles, HiOutlineUserPlus } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { register, clearError } from '../../store/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    dispatch(clearError());
    const result = await dispatch(register({ name, email, password }));
    if (register.fulfilled.match(result)) {
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } else {
      toast.error('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex gradient-bg relative overflow-hidden">
      <div className="absolute top-10 right-32 w-80 h-80 bg-accent-400/20 blob" />
      <div className="absolute bottom-10 left-20 w-72 h-72 bg-primary-400/30 blob" style={{ animationDelay: '3s' }} />

      {/* Left branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center relative z-10 px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 mx-auto border border-white/20">
            <HiOutlineUserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Join LectureMind</h1>
          <p className="text-xl text-primary-200 max-w-md leading-relaxed">
            Start transforming your lectures into structured learning materials with AI.
          </p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-surface-100/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 p-8 border border-surface-200/50">
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <HiOutlineSparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">LectureMind</span>
            </div>

            <h2 className="text-2xl font-bold text-surface-950 mb-1">Create account</h2>
            <p className="text-surface-600 mb-8">Get started for free</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400"
                >
                  {typeof error === 'string' ? error : 'Registration failed'}
                </motion.div>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-surface-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
