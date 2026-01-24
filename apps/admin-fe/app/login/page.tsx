"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      // Check if user is admin
      if (data.data.user.role !== "ADMIN") {
        throw new Error("Access denied. Admin privileges required.");
      }

      // Store token in localStorage
      if (data.data?.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }

      setMessage("Login successful. Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Blurred Abstract Background */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-white">
        {/* Abstract blurred shapes - Matching form's blue aesthetic */}
        <div className="absolute inset-0">
          {/* Primary blue chevron - matches form's blue-600 */}
          <div 
            className="absolute top-0 left-0 w-[750px] h-[750px]"
            style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.75) 0%, rgba(59, 130, 246, 0.6) 25%, rgba(96, 165, 250, 0.45) 50%, rgba(147, 197, 253, 0.3) 75%, rgba(219, 234, 254, 0.15) 90%, transparent 100%)',
              clipPath: 'polygon(0% 0%, 100% 0%, 55% 100%, 0% 100%)',
              filter: 'blur(80px)',
              transform: 'translate(-15%, -15%) rotate(-8deg)',
            }}
          />
          
          {/* Soft teal/cyan chevron - complements blue */}
          <div 
            className="absolute top-1/4 left-1/5 w-[700px] h-[700px]"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.7) 0%, rgba(56, 189, 248, 0.55) 25%, rgba(125, 211, 252, 0.4) 50%, rgba(186, 230, 253, 0.25) 75%, transparent 100%)',
              clipPath: 'polygon(0% 0%, 100% 0%, 65% 100%, 0% 100%)',
              filter: 'blur(85px)',
              transform: 'translate(-25%, -20%) rotate(12deg)',
            }}
          />
          
          {/* Light blue accent - subtle overlay */}
          <div 
            className="absolute bottom-0 left-0 w-[650px] h-[650px]"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.65) 0%, rgba(96, 165, 250, 0.5) 30%, rgba(147, 197, 253, 0.35) 60%, rgba(219, 234, 254, 0.2) 85%, transparent 100%)',
              clipPath: 'polygon(0% 0%, 100% 0%, 60% 100%, 0% 100%)',
              filter: 'blur(75px)',
              transform: 'translate(-20%, 20%) rotate(-3deg)',
            }}
          />
          
          {/* Soft indigo accent - adds depth */}
          <div 
            className="absolute top-1/2 left-1/3 w-[550px] h-[550px]"
            style={{
              background: 'linear-gradient(135deg, rgba(67, 56, 202, 0.6) 0%, rgba(99, 102, 241, 0.45) 40%, rgba(129, 140, 248, 0.3) 70%, transparent 100%)',
              clipPath: 'polygon(0% 0%, 100% 0%, 75% 100%, 0% 100%)',
              filter: 'blur(70px)',
              transform: 'translate(-30%, -30%) rotate(20deg)',
            }}
          />
          
          {/* Blue radial glow - matches button color */}
          <div 
            className="absolute top-1/3 right-1/4 w-[500px] h-[500px]"
            style={{
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.6) 0%, rgba(59, 130, 246, 0.45) 30%, rgba(96, 165, 250, 0.3) 60%, rgba(147, 197, 253, 0.15) 85%, transparent 100%)',
              filter: 'blur(65px)',
            }}
          />
          
          {/* Soft cyan accent */}
          <div 
            className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px]"
            style={{
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.55) 0%, rgba(56, 189, 248, 0.4) 40%, rgba(125, 211, 252, 0.25) 70%, transparent 90%)',
              filter: 'blur(60px)',
            }}
          />
        </div>
        
        {/* Logo in top-left */}
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Image
                src="/trackmed-logo.png"
                alt="TrackMed"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </div>
            <span className="text-xl font-semibold text-white">TrackMed</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            {/* Header */}
            <div className="flex items-baseline justify-between mb-6">
              <h1 className="text-3xl font-bold text-slate-900">Login</h1>
              <Link 
                href="/register" 
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Don&apos;t have an account?
              </Link>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="info@codedthemes.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.382 5.63m-2.092 2.092L3 3m0 0l18 18m-3.29-3.29A9.97 9.97 0 0118.618 18.37M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-600">Keep me sign in</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Error/Success Message */}
              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  isError 
                    ? "bg-red-50 text-red-700 border border-red-200" 
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {message}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {isSubmitting ? "Signing in..." : "Login"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
            <p>© Made with love by Team TrackMed</p>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-slate-700 transition-colors">
                Terms and Conditions
              </Link>
              <Link href="/privacy" className="hover:text-slate-700 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
