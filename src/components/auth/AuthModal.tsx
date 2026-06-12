"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { X, Github, Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mounted, setMounted] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username
                        }
                    }
                })
                if (error) throw error

                if (data.session) {
                    await supabase.from('profiles').upsert({
                        id: data.session.user.id,
                        username: username,
                        updated_at: new Date().toISOString()
                    })
                    onClose()
                } else {
                    setMessage("Kiểm tra email để nhận liên kết xác nhận!")
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                onClose()
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSocial = async (provider: 'google' | 'github') => {
        await supabase.auth.signInWithOAuth({
            provider,
        })
    }

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col z-[110] overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Header */}
                        <div className="pt-8 pb-6 px-6 text-center">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {isSignUp ? "Tạo tài khoản" : "Chào mừng trở lại"}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {isSignUp ? "Tham gia Watanare Reader" : "Đăng nhập để tiếp tục đọc"}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            {message && (
                                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-lg text-sm">
                                    {message}
                                </div>
                            )}

                            {/* Social buttons first */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleSocial('google')}
                                    className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition-colors border border-gray-200"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Google
                                </button>
                                <button
                                    onClick={() => handleSocial('github')}
                                    className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                                >
                                    <Github className="h-4 w-4" />
                                    GitHub
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wide">hoặc</span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleAuth} className="space-y-3">
                                {isSignUp && (
                                    <div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-pink-300 focus:bg-white transition-all"
                                            placeholder="Tên người dùng"
                                        />
                                    </div>
                                )}
                                <div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-pink-300 focus:bg-white transition-all"
                                            placeholder="Địa chỉ email"
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-11 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-pink-300 focus:bg-white transition-all"
                                            placeholder="Mật khẩu"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-pink-600 hover:bg-pink-500 text-white font-medium py-3 rounded-lg transition-colors mt-1"
                                >
                                    {loading ? "Vui lòng chờ..." : isSignUp ? "Tạo tài khoản" : "Đăng nhập"}
                                </Button>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <p className="text-sm text-center text-gray-500">
                                {isSignUp ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
                                <button
                                    onClick={() => {
                                        setIsSignUp(!isSignUp);
                                        setEmail("");
                                        setPassword("");
                                        setUsername("");
                                        setError(null);
                                        setMessage(null);
                                    }}
                                    className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
                                >
                                    {isSignUp ? "Đăng nhập" : "Đăng ký"}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
