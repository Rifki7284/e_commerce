"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-primary to-accent rounded-xl mb-4">
              <span className="text-lg font-bold text-primary-foreground">E</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">EcoStore</h1>
            <p className="text-sm text-muted-foreground">Your premium e-commerce platform</p>
          </div>

          {/* Form switcher tabs */}
          <div className="flex gap-2 mb-8 bg-secondary/50 p-1 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                isLogin ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !isLogin
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
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

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Demo: admin@example.com / password123 (Admin)
          <br />
          Demo: customer@example.com / password123 (Customer)
        </p>
      </div>
    </div>
  )
}
