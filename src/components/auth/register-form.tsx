"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { AlertCircle, Mail, Lock, User, ArrowRight } from "lucide-react"

interface RegisterFormProps {
  onSwitchMode: () => void
}
const registerSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function RegisterForm({ onSwitchMode }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const parsed = registerSchema.safeParse(formData)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      setError(firstError);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || "Registration failed")
      return
    }

    router.push("/home")
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Full Name</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className="pl-11 bg-slate-800/50 border-blue-500/30 text-white placeholder:text-slate-500 h-11 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
            className="pl-11 bg-slate-800/50 border-blue-500/30 text-white placeholder:text-slate-500 h-11 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            className="pl-11 bg-slate-800/50 border-blue-500/30 text-white placeholder:text-slate-500 h-11 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <Input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="••••••••"
            className="pl-11 bg-slate-800/50 border-blue-500/30 text-white placeholder:text-slate-500 h-11 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight size={18} />
          </>
        )}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  )
}