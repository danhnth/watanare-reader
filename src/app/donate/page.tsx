"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Bitcoin, Building2, Check, Copy, Coffee, Gem, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/ui/SiteHeader"

export default function DonatePage() {
    return (
        <div className="min-h-screen w-full bg-[#fdf2f5] text-gray-900 relative flex flex-col items-center justify-start md:justify-center pt-24 md:pt-0 p-6 overflow-x-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_-20%,#fce4ec,transparent_50%)] opacity-50 pointer-events-none" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_80%_80%,#fce4ec,transparent_40%)] opacity-50 pointer-events-none" />
            <div className="absolute inset-0 z-0 bg-[url('/assets/grid.svg')] opacity-[0.02] pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-rose-200/20 rounded-full blur-[150px] pointer-events-none" />

            {/* Header */}
            <SiteHeader showBack={true} backLink="/" transparent />

            <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center">

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-center mb-8 md:mb-12"
                >
                    <div className="flex items-center justify-center gap-3 md:gap-4 mb-3 md:mb-4">
                        <Coffee className="w-8 h-8 md:w-12 md:h-12 text-amber-500" />
                        <h1 className="text-3xl md:text-5xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-pink-500 to-pink-400">
                            Ủng hộ
                        </h1>
                    </div>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
                        Đóng góp của bạn giúp duy trì trang web này hoạt động, nhanh và không quảng cáo.
                        <span className="block mt-2 text-pink-500/70 text-sm">Mỗi đóng góp giúp tôi duy trì máy chủ và phát triển tính năng mới.</span>
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full mb-12">
                    <CryptoCard
                        name="Bitcoin"
                        symbol="BTC"
                        address="bc1pd2m9h5cyrfjy2j7hjpf2u9hg8crng65e4dr9j3mqrtlg7xgkl20se6psvf"
                        icon={Bitcoin}
                        colorClass="text-orange-500 group-hover:text-orange-600"
                        bgGradient="from-orange-500/10 to-orange-500/0"
                        qrPath="/assets/images/qr-codes/btc-qr-code.jpg"
                        delay={0.1}
                    />
                    <CryptoCard
                        name="Ethereum"
                        symbol="ETH"
                        address="0x80d88BFb00B11f6B9C585E8578822bbe4d5fBD1c"
                        icon={Gem}
                        colorClass="text-indigo-500 group-hover:text-indigo-600"
                        bgGradient="from-indigo-500/10 to-indigo-500/0"
                        qrPath="/assets/images/qr-codes/eth-qr-code.jpg"
                        delay={0.2}
                    />
                    <CryptoCard
                        name="MB Bank"
                        symbol="VN"
                        icon={Building2}
                        colorClass="text-teal-600 group-hover:text-teal-700"
                        bgGradient="from-teal-500/10 to-teal-500/0"
                        qrPath="/assets/images/qr-codes/mb-bank-qr-code.jpg"
                        delay={0.3}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <Link href="/">
                        <Button variant="ghost" className="group text-pink-500 hover:text-pink-700 hover:bg-pink-50 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Quay lại thư viện
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}

function CryptoCard({
    name,
    symbol,
    address,
    icon: Icon,
    colorClass,
    bgGradient,
    qrPath,
    delay
}: {
    name: string,
    symbol: string,
    address?: string,
    icon: LucideIcon,
    colorClass: string,
    bgGradient: string,
    qrPath?: string,
    delay: number
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn("relative group", address && "cursor-pointer")}
            onClick={address ? handleCopy : undefined}
        >
            <div className={cn(
                "absolute inset-0 rounded-2xl bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
                bgGradient
            )} />

            <div className="relative h-full bg-white border border-pink-100 group-hover:border-pink-200 rounded-2xl p-5 md:p-6 flex flex-col items-center text-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_4px_20px_rgba(233,30,99,0.12)]">

                <div className={cn("p-4 rounded-full bg-pink-50 mb-4 transition-colors", colorClass.replace('text-', 'bg-').replace('500', '500/10').replace('400', '400/10').replace('600', '600/10').replace('700', '700/10'))}>
                    <Icon className={cn("w-6 h-6 md:w-8 md:h-8 transition-colors", colorClass)} />
                </div>

                <h3 className="text-lg md:text-xl font-bold mb-1 text-gray-900">{name}</h3>
                <span className="text-xs font-mono text-pink-400 mb-4 md:mb-6 bg-pink-50 px-2 py-1 rounded">{symbol}</span>

                {qrPath && (
                    <div className="w-full bg-pink-50 rounded-lg p-3 border border-pink-100 flex items-center justify-center group-hover:border-pink-200 transition-colors mb-3">
                        <img
                            src={qrPath}
                            alt={`${name} QR Code`}
                            className="w-full h-auto max-w-[160px] rounded"
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.style.display = "none"
                            }}
                        />
                    </div>
                )}

                {address ? (
                    <div className="w-full bg-pink-50 rounded-lg p-3 border border-pink-100 flex items-center justify-between gap-2 md:gap-3 group-hover:border-pink-200 transition-colors">
                        <code className="text-[10px] md:text-xs text-gray-600 font-mono break-all text-left line-clamp-1">
                            {address.slice(0, 10)}...{address.slice(-10)}
                        </code>
                        <div className="shrink-0 text-pink-400">
                            {copied ? (
                                <Check className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                            ) : (
                                <Copy className="w-3 h-3 md:w-4 md:h-4 group-hover:text-pink-600 transition-colors" />
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-[10px] md:text-xs text-pink-400 uppercase tracking-wider font-bold">
                        Quét mã để chuyển khoản
                    </p>
                )}

                {address && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className={cn("text-[10px] uppercase tracking-wider font-bold py-1 px-2 rounded-full bg-pink-50 backdrop-blur-sm", copied ? "text-green-500" : "text-pink-400")}>
                            {copied ? "Đã sao chép!" : "Nhấp để sao chép"}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
