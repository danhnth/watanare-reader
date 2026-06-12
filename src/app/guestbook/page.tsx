"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, BookOpen, Send, PenLine, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface GuestbookEntry {
    id: number
    name: string
    message: string
    created_at: string
}

function timeAgo(dateStr: string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    return `${Math.floor(months / 12)}y ago`
}

export default function GuestbookPage() {
    const [entries, setEntries] = useState<GuestbookEntry[]>([])
    const [name, setName] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchEntries()
    }, [])

    const fetchEntries = async () => {
        try {
            const { data, error } = await supabase
                .from('guestbook')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100)

            if (error) throw error
            if (data) setEntries(data)
        } catch {
            setError("Failed to load entries")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        setSubmitting(true)
        setError("")

        try {
            const { data, error } = await supabase
                .from('guestbook')
                .insert([{
                    name: name.trim() || 'Anonymous',
                    message: message.trim()
                }])
                .select()
                .single()

            if (error) throw error

            if (data) {
                setEntries(prev => [data, ...prev])
                setMessage("")
                listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            }
        } catch (err: any) {
            setError(err.message || "Failed to submit. Try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#fdf2f5] text-gray-900 relative flex flex-col items-center pt-24 md:pt-16 p-4 md:p-6 overflow-hidden">

            {/* Background — warm notebook feel */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_-10%,#fce4ec,transparent_50%)] opacity-40" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_100%,#fce4ec,transparent_50%)] opacity-40" />

            {/* Subtle ruled-line pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.04]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,0,0,0.08) 39px, rgba(0,0,0,0.08) 40px)',
                    backgroundSize: '100% 40px'
                }}
            />

            {/* Back button */}
            <div className="absolute top-6 left-6 z-20">
                <Link href="/">
                    <Button variant="ghost" className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Thư viện
                    </Button>
                </Link>
            </div>

            <div className="z-10 w-full max-w-2xl mx-auto flex flex-col items-center">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-amber-600/80" />
                        <h1 className="text-3xl md:text-4xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500/70">
                            Sổ lưu bút
                        </h1>
                    </div>
                    <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-md mx-auto">
                        Để lại dấu ấn. Ký sổ, chia sẻ suy nghĩ, hoặc chỉ cần chào một tiếng.
                    </p>
                </motion.div>

                {/* Write form — notebook card style */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full mb-8"
                >
                    <div className="relative bg-white border border-amber-200/40 rounded-2xl p-5 md:p-6 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">

                        {/* Red margin line accent */}
                        <div className="absolute left-10 md:left-12 top-0 bottom-0 w-[1px] bg-red-200/40 rounded-full" />

                        <div className="flex items-center gap-2 mb-2 text-amber-600/70">
                            <PenLine className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest font-medium">Ký sổ</span>
                        </div>

                        <input
                            type="text"
                            placeholder="Tên của bạn (tùy chọn)"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            maxLength={30}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                        />

                        <textarea
                            placeholder="Viết gì đó..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            maxLength={500}
                            rows={3}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all resize-none font-serif leading-relaxed"
                        />

                        <div className="flex items-center justify-between">
                            <span className="text-[11px] text-gray-400">
                                {message.length}/500
                            </span>
                            <Button
                                type="submit"
                                disabled={submitting || !message.trim()}
                                className="bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-5 py-2 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(217,119,6,0.2)] hover:shadow-[0_4px_20px_rgba(217,119,6,0.3)]"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5 mr-2" />
                                        Ký
                                    </>
                                )}
                            </Button>
                        </div>

                        {error && (
                            <p className="text-xs text-red-500 mt-1">{error}</p>
                        )}
                    </div>
                </motion.form>

                {/* Entries */}
                <motion.div
                    ref={listRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full space-y-3 max-h-[60vh] overflow-y-auto pr-1"
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-amber-600/60" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Chưa có lượt ký nào. Hãy là người đầu tiên!</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {entries.map((entry, i) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: i < 10 ? i * 0.04 : 0 }}
                                    className="group relative bg-white hover:bg-pink-50/30 border border-gray-100 hover:border-amber-200/50 rounded-xl px-5 py-4 transition-all duration-300"
                                >
                                    {/* Subtle left accent bar */}
                                    <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-amber-300/30 group-hover:bg-amber-500/50 transition-colors" />

                                    <div className="flex items-baseline justify-between mb-1.5">
                                        <span className="text-sm font-semibold text-amber-700/80 font-serif">
                                            {entry.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 tabular-nums">
                                            {timeAgo(entry.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed font-serif whitespace-pre-wrap break-words">
                                        {entry.message}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 mb-6"
                >
                    <Link href="/">
                        <Button variant="ghost" className="group text-gray-500 hover:text-gray-800 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Quay lại thư viện
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}
