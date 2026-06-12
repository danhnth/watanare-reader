"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { watanareMetadata } from "@/data/watanare";
import BackgroundSlideshow from "@/components/BackgroundSlideshow";

// Default slideshow images
const DEFAULT_SLIDESHOW_IMAGES = [
  "/assets/images/bg/bg_1.jpg",
  "/assets/images/bg/bg_2.jpg",
  "/assets/images/bg/bg_3.jpg",
  "/assets/images/bg/bg_4.jpg",
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden bg-[#fdf2f5] text-gray-900">
      {/* Background Slideshow */}
      <BackgroundSlideshow images={DEFAULT_SLIDESHOW_IMAGES} />

      {/* Header */}
      <SiteHeader showBack={false} transparent />

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="z-10 flex flex-col items-center gap-6 max-w-4xl"
        >
          {/* Placeholder Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className="mb-4"
          >
            <img
              src="/assets/Watanare-logo.png"
              alt="Watanare Logo"
              className="w-64 md:w-80 lg:w-[28rem] h-auto drop-shadow-[0_4px_20px_rgba(233,30,99,0.2)]"
            />
          </motion.div>

          {/* Decorative Heart Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-2"
          >
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500/20" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-serif text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl text-center leading-tight"
          >
            <span className="inline-block md:mr-4">
              <span
                className="text-[#c9a227]"
                style={{ textShadow: "0 1px 3px rgba(201,162,39,0.2)" }}
              >
                There&apos;s
              </span>
              {" "}
              <span
                className="text-[#e91e63]"
                style={{ textShadow: "0 1px 3px rgba(233,30,99,0.2)" }}
              >
                No
              </span>
              {" "}
              <span
                className="text-[#0d9488]"
                style={{ textShadow: "0 1px 3px rgba(13,148,136,0.2)" }}
              >
                Freaking
              </span>
              {" "}
              <span
                className="text-[#c9a227]"
                style={{ textShadow: "0 1px 3px rgba(201,162,39,0.2)" }}
              >
                Way
              </span>
            </span>
            <br className="lg:hidden" />
            <span className="inline-block mt-2 lg:mt-0">
              <span
                className="text-[#0d9488]"
                style={{ textShadow: "0 1px 3px rgba(13,148,136,0.2)" }}
              >
                I&apos;ll
              </span>
              {" "}
              <span
                className="text-[#0d9488]"
                style={{ textShadow: "0 1px 3px rgba(13,148,136,0.2)" }}
              >
                be
              </span>
              {" "}
              <span
                className="text-[#0d9488]"
                style={{ textShadow: "0 1px 3px rgba(13,148,136,0.2)" }}
              >
                Your
              </span>
              {" "}
              <span
                className="text-[#e91e63]"
                style={{ textShadow: "0 1px 3px rgba(233,30,99,0.2)" }}
              >
                Lover!
              </span>
              {" "}
              <span className="text-gray-500">
                Unless...
              </span>
            </span>
          </motion.h1>

          {/* Japanese Title */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm text-pink-600 font-mono tracking-widest font-medium drop-shadow-sm"
          >
            わたしが恋人になれるわけないじゃん、ムリムリ！（※ムリじゃなかった!?）
          </motion.p>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="relative mt-4 max-w-2xl"
          >
            <p className="font-serif text-lg italic text-gray-600 md:text-xl leading-relaxed">
              &quot;{watanareMetadata.quote}&quot;
            </p>
            <p className="mt-2 text-sm text-pink-600 font-bold tracking-widest uppercase font-mono">
              - {watanareMetadata.quoteAttribution}
            </p>
          </motion.div>

          {/* Synopsis */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-xl mt-4"
          >
            <p className="text-base text-gray-700 leading-relaxed font-serif font-medium">
              {watanareMetadata.synopsis}
            </p>
          </motion.div>

          {/* Metadata Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex flex-wrap gap-2 justify-center mt-2"
          >
            {watanareMetadata.genre.map((g) => (
              <span
                key={g}
                className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border border-pink-200 bg-pink-50 text-pink-600"
              >
                {g}
              </span>
            ))}
            <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-600">
              {watanareMetadata.status}
            </span>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/watanare/select">
              <Button
                size="lg"
                className="group text-lg px-10 py-6 rounded-full bg-pink-600 hover:bg-pink-500 text-white shadow-[0_4px_20px_rgba(233,30,99,0.3)] hover:shadow-[0_4px_30px_rgba(233,30,99,0.4)] transition-all duration-200 cursor-pointer"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Bắt đầu đọc
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

      </section>

      {/* Thematic Footer */}
      <footer className="w-full py-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-pink-400/40 border-t border-pink-100 bg-white/30 backdrop-blur-sm z-10">
        <p>&copy; 2026 Novels Reader. Không liên kết với nhượng quyền Watanare chính thức.</p>
      </footer>
    </main>
  );
}
