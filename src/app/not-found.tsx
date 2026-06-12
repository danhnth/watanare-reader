"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/ui/SiteHeader"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#fdf2f5] text-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_-20%,#fce4ec,transparent_50%)] opacity-50 pointer-events-none" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_80%_80%,#fce4ec,transparent_40%)] opacity-50 pointer-events-none" />
            <div className="absolute inset-0 z-0 bg-[url('/assets/grid.svg')] opacity-[0.02] pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-rose-200/20 rounded-full blur-[150px] pointer-events-none" />

            {/* Header */}
            <SiteHeader showBack={true} backLink="/" transparent />

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg space-y-8 mt-16">
                {/* 404 code */}
                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-[120px] md:text-[150px] font-bold font-serif leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-pink-600 via-pink-400 to-pink-300 opacity-90 select-none"
                >
                    404
                </motion.h1>

                {/* Text content */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="space-y-3"
                >
                    <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900">
                        Không tìm thấy trang
                    </h2>
                    <p className="text-gray-600 max-w-sm mx-auto">
                        Oops! Renako đã đi lạc rồi. Trang này không tồn tại... yet.
                    </p>
                </motion.div>

                {/* Character image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative w-48 h-48 md:w-64 md:h-64"
                >
                    <div className="w-full h-full rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center overflow-hidden shadow-[0_4px_20px_rgba(233,30,99,0.15)]">
                        <img
                            src="/assets/images/renako_404.png"
                            alt="Renako - Page Not Found"
                            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                                e.currentTarget.style.display = "none"
                            }}
                        />
                    </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 w-full justify-center"
                >
                    <Link href="/">
                        <Button
                            variant="default"
                            className="w-full sm:w-auto bg-pink-600 hover:bg-pink-500 text-white shadow-[0_4px_20px_rgba(233,30,99,0.3)] hover:shadow-[0_4px_30px_rgba(233,30,99,0.4)] transition-all duration-200"
                        >
                            <Home className="mr-2 w-4 h-4" /> Về trang chủ
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}
