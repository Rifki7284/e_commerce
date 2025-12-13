"use client"
import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import { Key } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Subtle background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-500/20 p-8">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-blue-600 to-blue-500 rounded-xl mb-4">
              <Key className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              GameKeys
            </h1>
            <p className="text-sm text-slate-400">
              Welcome back to your account
            </p>
          </div>

          {/* Form switcher tabs */}
          <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-lg border border-slate-700/30">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Forms */}
          {isLogin ? (
            <LoginForm onSwitchMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchMode={() => setIsLogin(true)} />
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Secure checkout • Instant delivery • 24/7 customer support
        </p>
      </div>
    </div>
  )
}