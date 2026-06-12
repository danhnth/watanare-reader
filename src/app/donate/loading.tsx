"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen w-full bg-[#fdf2f5] flex flex-col items-center justify-start md:justify-center pt-24 md:pt-0 p-6">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-12">

                {/* Hero Text */}
                <div className="flex flex-col items-center gap-4 text-center w-full">
                    <Skeleton className="h-12 w-12 rounded-full bg-pink-100" />
                    <Skeleton className="h-10 w-3/4 md:w-1/2 bg-pink-100 rounded-lg" />
                    <Skeleton className="h-4 w-full max-w-md bg-pink-50 rounded" />
                </div>

                {/* Crypto Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] md:aspect-[3/4] bg-pink-50 rounded-2xl p-6 flex flex-col items-center gap-6">
                            <Skeleton className="h-16 w-16 rounded-full bg-pink-100" />
                            <Skeleton className="h-6 w-24 bg-pink-100 rounded" />
                            <Skeleton className="h-4 w-12 bg-pink-50 rounded" />
                            <Skeleton className="h-12 w-full bg-pink-50 rounded-lg mt-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
