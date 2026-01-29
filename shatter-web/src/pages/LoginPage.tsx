import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store token
      localStorage.setItem('token', data.token);
      
      // Redirect to home
      navigate('/');
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #0a0f1a, #1B253A, #0a0f1a)",
      }}
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 animate-float-slow opacity-10">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <g stroke="#4DC4FF" strokeWidth="2" fill="none">
              <line x1="30" y1="10" x2="30" y2="50" />
              <line x1="10" y1="30" x2="50" y2="30" />
              <line x1="15" y1="15" x2="45" y2="45" />
              <line x1="15" y1="45" x2="45" y2="15" />
              <circle cx="30" cy="30" r="6" />
            </g>
          </svg>
        </div>
        
        <div className="absolute bottom-20 right-10 animate-float-medium opacity-10">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <g stroke="#4DC4FF" strokeWidth="2" fill="none">
              <line x1="40" y1="10" x2="40" y2="70" />
              <line x1="10" y1="40" x2="70" y2="40" />
              <line x1="18" y1="18" x2="62" y2="62" />
              <line x1="18" y1="62" x2="62" y2="18" />
              <circle cx="40" cy="40" r="8" />
            </g>
          </svg>
        </div>
      </div>

      {/* Auth Card */}
      <div 
        className="w-full max-w-md backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative z-10"
        style={{ backgroundColor: 'rgba(27, 37, 58, 0.6)' }}
      >
      {/* Logo/Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          {/* Logo */}
          <img
            src="/src/assets/ShatterLogo_White.png"
            alt="Shatter Logo"
            className="w-10 h-10 opacity-90 drop-shadow-[0_0_15px_rgba(77,196,255,0.5)]"
          />

          {/* Title */}
          <h1 className="text-4xl font-heading font-semibold text-white">
            Shatter
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-white/70 font-body">
          {isLogin ? 'Welcome back!' : 'Create your account'}
        </p>
      </div>

        {/* Error Message */}
        {error && (
          <div 
            className="mb-6 p-3 rounded-lg border text-sm"
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: '#fca5a5'
            }}
          >
            {error}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Name Field (Signup only) */}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-body text-white/80 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
                placeholder="John Doe"
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-body text-white/80 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-body text-white/80 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password Field (Signup only) */}
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-body text-white/80 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
                placeholder="••••••••"
              />
            </div>
          )}

          {/* Forgot Password (Login only) */}
          {isLogin && (
            <div className="text-right">
              <button className="text-sm text-[#4DC4FF] hover:underline font-body">
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-full font-semibold font-body transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: loading ? '#6b7280' : '#4DC4FF',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#3ab4e6';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#4DC4FF';
              }
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </div>

        {/* Toggle Login/Signup */}
        <div className="mt-6 text-center">
          <p className="text-white/70 font-body text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className="text-[#4DC4FF] hover:underline font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Divider */}
        <div className="mt-8 mb-6 flex items-center">
          <div className="flex-1 border-t border-white/20"></div>
          <span className="px-4 text-sm text-white/50 font-body">or</span>
          <div className="flex-1 border-t border-white/20"></div>
        </div>

        {/* Social Login Button */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full py-3 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors font-body flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(120deg); }
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}