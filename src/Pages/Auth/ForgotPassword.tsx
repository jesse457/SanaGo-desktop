import React, { useState } from "react";
import {
  ShieldCheck,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../../providers/ThemeProvider";

const ForgotPasswordPage = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !email.includes("@")) {
      setIsLoading(false);
      setError("Enter a valid institutional email.");
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-main text-main transition-colors duration-500 selection:bg-primary-500/30">
      {/* LEFT: VISUAL */}
      <div className="hidden lg:flex relative flex-col justify-between p-20 bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/40 via-zinc-950/90 to-zinc-950 z-10" />
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-30"
            alt="Security"
          />
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-500/10 rounded-full blur-[120px] z-10" />
        </div>

        <div className="relative z-20 flex items-center gap-2 opacity-50">
          <Activity size={24} className="text-primary-400" />
          <span className="text-sm font-bold tracking-[0.4em] text-white uppercase">
            SANAGO RECOVERY NODE
          </span>
        </div>

        <div className="relative z-20 max-w-xl">
          <h3 className="text-6xl font-black text-white leading-none tracking-tight mb-8">
            Identity <br />
            <span className="text-primary-500 italic">Validation.</span>
          </h3>
          <div className="h-1 w-20 bg-primary-600 mb-8 rounded-full" />
          <p className="text-xl text-zinc-400 font-medium leading-relaxed border-l-4 border-primary-600 pl-8 ml-2">
            Verify your credentials to re-establish secure access to the Sanago
            Clinical infrastructure.
          </p>
        </div>

        <div className="relative z-20 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">
          SYSTEM SECURITY PROTOCOL V1.2
        </div>
      </div>

      {/* RIGHT: CONTENT */}
      <div className="flex items-center justify-center p-8 relative bg-white dark:bg-zinc-950">
        <div className="w-full max-w-md relative z-10">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-600/20">
                    <ShieldCheck className="text-white" size={28} />
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight">
                    Security Recovery
                  </h1>
                  <p className="text-zinc-500 font-medium text-sm">
                    Enter your registered email to receive a secure access key.
                  </p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-label ml-1">Work Email</label>
                    <div className="relative group">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary-500 transition-colors"
                        size={18}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`input-base pl-12 h-14 font-medium transition-all ${error ? "border-rose-500 ring-rose-500/10 focus:border-rose-500" : ""}`}
                        placeholder="name@facility.com"
                        autoFocus
                      />
                    </div>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-[11px] font-bold text-rose-500 flex items-center gap-1.5 uppercase tracking-tight"
                      >
                        <AlertCircle size={14} /> {error}
                      </motion.p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 button-primary flex items-center justify-center gap-3 text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        Validating...
                      </>
                    ) : (
                      "Request Recovery Key"
                    )}
                  </button>
                </form>

                <div className="text-center pt-4">
                  <Link
                    to="/login"
                    className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-primary-600 flex items-center justify-center gap-2 transition-all group"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Return to Authentication
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-10"
              >
                <div className="relative mx-auto w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center shadow-xl shadow-emerald-500/5">
                  <CheckCircle2
                    className="h-14 w-14 text-emerald-500"
                    strokeWidth={2.5}
                  />
                  <div className="absolute inset-0 rounded-3xl animate-pulse bg-emerald-500/10" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight">
                    Check your secure inbox
                  </h2>
                  <p className="text-zinc-500 font-medium text-sm">
                    A recovery link has been dispatched to: <br />
                    <span className="text-primary-600 font-bold block mt-2 text-base">
                      {email}
                    </span>
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <Link
                    to="/login"
                    className="w-full h-14 button-primary flex items-center justify-center"
                  >
                    Back to Login
                  </Link>

                  <div className="pt-6">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                      No message received?
                    </p>
                    <button
                      disabled={isLoading}
                      className="text-xs font-bold text-primary-600 hover:text-primary-500 uppercase tracking-widest flex items-center justify-center mx-auto gap-2"
                    >
                      {isLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Dispatch Again"
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 card-base bg-amber-500/5 border-amber-500/20 text-left">
                  <div className="flex gap-4">
                    <Info className="h-5 w-5 text-amber-600 shrink-0" />
                    <p className="text-[10px] text-amber-800 dark:text-amber-500 leading-relaxed font-bold uppercase tracking-tight">
                      Verification may take up to 2 minutes. Check your
                      junk/spam folder before re-requesting.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
