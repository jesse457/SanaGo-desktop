import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../providers/ThemeProvider";

const ResetPasswordPage = ({ email = "nurse.jesse@station-os.med" }) => {
  const { theme } = useTheme();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [strength, setStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let score = 0;
    if (password.length > 7) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;
    setStrength(score);
  }, [password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (strength < 3) {
      setError("Password does not meet enterprise requirements.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  const getStrengthColor = (index) => {
    if (strength === 0) return "bg-zinc-200 dark:bg-zinc-800";
    if (strength <= 1)
      return index === 0 ? "bg-rose-500" : "bg-zinc-200 dark:bg-zinc-800";
    if (strength <= 2)
      return index <= 1 ? "bg-amber-500" : "bg-zinc-200 dark:bg-zinc-800";
    if (strength <= 3)
      return index <= 2 ? "bg-primary-500" : "bg-zinc-200 dark:bg-zinc-800";
    return "bg-emerald-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans antialiased text-main selection:bg-primary-500/30">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #6366f1 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10 card-base bg-white dark:bg-zinc-900 shadow-2xl p-8 sm:p-12 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-600/20">
                  <ShieldCheck
                    className="text-white"
                    size={28}
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">
                    Access Reset
                  </h1>
                  <p className="text-zinc-500 font-medium text-sm mt-1">
                    Re-establish your medical security keys.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-label ml-1">Account Node</label>
                  <div className="flex items-center w-full px-4 h-14 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 select-none cursor-not-allowed">
                    <Mail className="w-4 h-4 mr-3 opacity-50" />
                    <span className="text-sm font-bold opacity-60 uppercase tracking-tight">
                      {email}
                    </span>
                    <Lock className="w-4 h-4 ml-auto opacity-30" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-label ml-1">New Security Key</label>
                  <div className="relative group">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-base h-14 pr-12 font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary-500 transition-colors"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex gap-1.5 h-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-500 ${getStrengthColor(i)}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.1em]">
                      <span className="text-zinc-400">
                        Security Requirement
                      </span>
                      <span
                        className={
                          strength <= 1
                            ? "text-rose-500"
                            : strength <= 2
                              ? "text-amber-500"
                              : "text-emerald-500"
                        }
                      >
                        {password.length > 0
                          ? [
                              "Insecure",
                              "Minimal",
                              "Stable",
                              "Strong",
                              "Enterprise",
                            ][strength]
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-label ml-1">
                    Confirm Security Key
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="input-base h-14 font-medium"
                      placeholder="••••••••"
                    />
                    <div
                      className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${confirm.length > 0 && confirm === password ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"}`}
                    >
                      <CheckCircle2
                        className="h-5 w-5 text-emerald-500"
                        strokeWidth={3}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-[11px] font-bold uppercase flex items-center gap-2 px-1"
                  >
                    <AlertCircle size={14} /> {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 button-primary flex items-center justify-center gap-3 text-base shadow-xl shadow-primary-500/10"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Updating Secure Node...
                    </>
                  ) : (
                    "Modernize Security Key"
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-8"
            >
              <div className="mx-auto h-20 w-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/5">
                <CheckCircle2
                  className="h-12 w-12 text-emerald-500"
                  strokeWidth={3}
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  Key Successfully Updated
                </h2>
                <p className="text-zinc-500 font-medium text-sm">
                  Your clinical node credentials have been synchronized.
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full h-14 button-primary flex items-center justify-center"
              >
                Establish New Session
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-10 flex items-center gap-3">
        <Activity size={18} className="text-primary-500 opacity-30" />
        <span className="text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase">
          Sanago Enterprise Security
        </span>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
