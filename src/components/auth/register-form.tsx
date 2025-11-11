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

    router.push("/auth/signin")
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">Full Name</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className="pl-11 bg-input border-border text-foreground placeholder:text-muted-foreground/60 h-11 rounded-lg"
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
            className="pl-11 bg-input border-border text-foreground placeholder:text-muted-foreground/60 h-11 rounded-lg"
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            className="pl-11 bg-input border-border text-foreground placeholder:text-muted-foreground/60 h-11 rounded-lg"
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="••••••••"
            className="pl-11 bg-input border-border text-foreground placeholder:text-muted-foreground/60 h-11 rounded-lg"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight size={18} />
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-primary hover:text-accent font-semibold transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  )
}
