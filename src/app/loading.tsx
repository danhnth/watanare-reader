"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen w-full bg-[#fdf2f5] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-pink-100 border-t-pink-500 animate-spin" />
                </div>
                <div className="space-y-3 w-64">
                    <Skeleton className="h-4 w-full bg-pink-100/50" />
                    <Skeleton className="h-4 w-3/4 mx-auto bg-pink-100/50" />
                </div>
            </div>
        </div>
    )
}
