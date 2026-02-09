import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  XCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

// Hooks & Providers
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../providers/AuthProvider";
import { useNetworkStatus } from "../../providers/NetworkProvider"; 
import { authService } from "../../services/authService";

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

const LoginPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  // States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    remember: false,
  });

  /**
   * ELECTRON TITLEBAR INTEGRATION
   * Uses your specific electronAPI.updateTitleBar from contextBridge
   */
useEffect(() => {
  // On the Login page, the buttons are over the RIGHT panel (which is always dark/zinc-950)
  // We match the background of the image overlay to make it look "transparent"
  window.electronAPI.updateTitleBar({
    theme: 'dark', // Force dark icons for the image side
    backgroundColor: '#09090b', // This matches your zinc-950 image overlay
    symbolColor: '#a1a1aa', // Zinc-400 symbols
  });

  return () => {
    // When leaving login, return to standard theme-based colors
    window.electronAPI.updateTitleBar({
      theme: theme as 'light' | 'dark' | 'system',
      backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff',
      symbolColor: theme === 'dark' ? '#ffffff' : '#3f3f46',
    });
  };
}, [theme]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError(null);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isOnline) {
      setError("Network protocol failure. Cannot establish connection while offline.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      await login(response.token, response.user);

      // Role-based redirection logic
      switch (response.user.role) {
        case 'admin': navigate('/admin/dashboard'); break;
        case 'receptionist': navigate('/reception/dashboard'); break;
        case 'doctor': navigate('/doctor/dashboard'); break;
        case 'pharmacist': navigate('/pharmacist/dashboard'); break;
        case 'lab-technician': navigate('/laboratory/dashboard'); break;
        default: navigate('/'); 
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Access Denied. Invalid credentials or system error.";
      console.log(err)
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-primary-500/30 overflow-hidden">
      
      {/* DRAGGABLE REGION (Handles the transparent title bar area) */}
      <div className="fixed top-0 left-0 w-full h-10 z-[60] pointer-events-none" style={{ WebkitAppRegion: 'drag' } as any} />

      {/* ERROR TOAST */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-12 right-8 z-[100] max-w-sm w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-start gap-4 border border-rose-500/20"
          >
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
              <XCircle className="text-rose-500" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold uppercase tracking-tight">Security Alert</h4>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT: CONTENT */}
      <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/30 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md mx-auto"
        >
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-600/20" style={{ WebkitAppRegion: 'no-drag' } as any}>
                <ShieldCheck className="text-white" size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                  Sana<span className="text-primary-600 not-italic">Go</span>
                </h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] leading-none">Security Node</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold tracking-tight mb-3">Welcome back.</h2>
            <p className="text-zinc-500 font-medium text-sm">Clinical Enterprise Access Control</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email / ID</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@facility.com"
                  className="w-full h-14 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Security Key</label>
                <Link to="/forgot-password"  className="text-[11px] font-bold text-primary-600 hover:text-primary-500 tracking-tight">
                  Recover Key
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* <div className="flex items-center justify-between py-1 px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="remember"
                  className="hidden"
                  checked={formData.remember}
                  onChange={handleInputChange}
                />
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                  formData.remember 
                    ? "bg-primary-600 border-primary-600 shadow-lg shadow-primary-600/30" 
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                }`}>
                  {formData.remember && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors uppercase tracking-wider">
                  Keep Session
                </span>
              </label>
            </div> */}

            <button
              type="submit"
              disabled={isLoading || !isOnline}
              className="w-full h-14 bg-primary-600 hover:bg-primary-700 disabled:bg-zinc-400 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary-600/20 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>{isOnline ? 'Establish Connection' : 'System Offline'}</>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                isOnline 
                ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              }`} />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Global Node: {isOnline ? 'Active' : 'Offline'}
              </span>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">v1.2.0-secure</p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT: VISUAL */}
      <div className="hidden lg:block relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/40 via-zinc-950/90 to-zinc-950 z-10" />
        <motion.img
          initial={{ scale: 1.1, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover grayscale-[20%]"
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80"
          alt="Medical Facility"
        />

        <div className="absolute inset-0 z-20 p-20 flex flex-col justify-between">
          <div className="flex items-center gap-2 opacity-50">
            <Activity size={24} className="text-primary-400" />
            <span className="text-sm font-bold tracking-[0.4em] text-white uppercase">SANAGO ENTERPRISE</span>
          </div>

          <div className="max-w-xl">
            <h3 className="text-6xl font-black text-white leading-none tracking-tight mb-8">
              Digital <br />
              <span className="text-primary-500 italic">Sanctuary.</span>
            </h3>
            <div className="h-1 w-20 bg-primary-600 mb-8 rounded-full" />
            <p className="text-xl text-zinc-400 font-medium leading-relaxed border-l-4 border-primary-600 pl-8 ml-2">
              Enterprise-grade medical operations management and unified data infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Facility Uptime</p>
              <p className="text-2xl font-black text-white tracking-widest leading-none">99.99%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Personnel</p>
              <p className="text-2xl font-black text-white tracking-widest leading-none">1,240+</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;