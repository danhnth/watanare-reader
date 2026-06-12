"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { List, ArrowLeft, LayoutGrid, Search, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";

import { WatanareVolumeData, watanareSideStories } from "@/data/watanare";
import { UserMenu } from "@/components/auth/UserMenu";
import dynamic from "next/dynamic";

const AuthModal = dynamic(() => import("@/components/auth/AuthModal").then(mod => mod.AuthModal), { ssr: false });
const ProfileModal = dynamic(() => import("@/components/auth/ProfileModal").then(mod => mod.ProfileModal), { ssr: false });

interface VolumeWithToc extends WatanareVolumeData {
  toc?: { label: string; href: string; index: number }[] | null;
  isbn: string;
}

interface WatanareSelectClientProps {
  volumes: VolumeWithToc[];
}

// Helper to format short labels for the grid view
const getCompactChapterLabel = (title: string, displayNumber: number | null) => {
  const lower = title.toLowerCase();
  if (lower.includes("illustration") || lower.includes("イラスト") || lower.includes("minh họa")) return "Minh họa";
  if (lower.includes("afterword") || lower.includes("lời tác giả")) return "Lời tác giả";
  if (lower.includes("prologue") || lower.includes("lời mở đầu") || lower.includes("プロローグ")) return "Mở đầu";
  if (lower.includes("epilogue") || lower.includes("lời kết") || lower.includes("エピローグ")) return "Kết";
  const chapterMatch = title.match(/(?:chapter|chương|第)\s*(\d+(?:\.\d+)?)/i);
  if (chapterMatch) return `Ch. ${chapterMatch[1]}`;
  const numMatch = title.match(/^(\d+)[\.\:\s]/);
  if (numMatch) return `Ch. ${numMatch[1]}`;
  if (displayNumber !== null) return `Ch. ${displayNumber}`;
  // Final fallback
  if (title.length > 15) {
    const anyNum = title.match(/^(\d+)/);
    if (anyNum) return `Ch. ${anyNum[1]}`;
    return title.slice(0, 12) + "...";
  }
  return title;
};

export default function WatanareSelectClient({ volumes }: WatanareSelectClientProps) {
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("compact");
  const [selectedVolume, setSelectedVolume] = useState<VolumeWithToc | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, { percentage: number; chapterTitle: string }>>({});
  const [activeTab, setActiveTab] = useState<"main" | "side">("main");
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [chaptersViewMode, setChaptersViewMode] = useState<"grid" | "detailed">("detailed");

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setTimeout(() => {
        setViewMode("detailed");
      }, 0);
    }

    const progress: Record<string, { percentage: number; chapterTitle: string }> = {};
    const allVols = [...volumes, ...watanareSideStories];
    allVols.forEach(vol => {
      const savedMeta = localStorage.getItem(`watanare-progress-meta-${vol.id}`);
      if (savedMeta) {
        try {
          progress[vol.id] = JSON.parse(savedMeta);
        } catch {}
      } else {
        const savedCfi = localStorage.getItem(`watanare-progress-${vol.id}`);
        if (savedCfi) {
          progress[vol.id] = { percentage: 0, chapterTitle: "Continue Reading" };
        }
      }
    });
    setTimeout(() => {
      setProgressMap(progress);
    }, 0);
  }, [volumes]);

  useEffect(() => {
    if (selectedVolume) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedVolume]);

  const currentVolumesList = useMemo(() => {
    return activeTab === "main" ? volumes : (watanareSideStories as VolumeWithToc[]);
  }, [activeTab, volumes]);

  const filteredVolumes = useMemo(() => {
    if (!searchQuery) return currentVolumesList;
    const lowerQuery = searchQuery.toLowerCase();
    return currentVolumesList.filter(
      vol =>
        vol.title.toLowerCase().includes(lowerQuery) ||
        vol.synopsis.toLowerCase().includes(lowerQuery) ||
        vol.volumeNumber.toLowerCase().includes(lowerQuery) ||
        (vol.toc || vol.chapters).some(ch =>
          typeof ch === 'string' ? ch.toLowerCase().includes(lowerQuery) : ch.label.toLowerCase().includes(lowerQuery)
        )
    );
  }, [currentVolumesList, searchQuery]);

  return (
    <div className="min-h-screen w-full bg-[#fdf2f5] text-gray-900 overflow-y-auto relative flex flex-col items-center select-none">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none fixed">
        <div className="absolute inset-0 bg-[#fdf2f5]/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdf2f5] via-[#fdf2f5]/40 to-transparent z-10" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[150px]" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.02] bg-[url('/assets/grid.svg')] mix-blend-overlay fixed pointer-events-none z-20" />

      {/* Top Header */}
      <header className="sticky top-0 left-0 w-full z-50 p-6 bg-gradient-to-b from-[#fdf2f5]/90 to-transparent backdrop-blur-md flex items-center justify-between border-b border-pink-100">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-full transition-all">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="ml-4 text-sm sm:text-base md:text-lg lg:text-xl font-serif font-extralight tracking-[0.15em] uppercase text-gray-700 truncate max-w-[200px] sm:max-w-none">
            Watanare <span className="text-pink-600 font-normal">Reader</span>
          </h1>
        </div>

        <UserMenu
          onSignIn={() => setAuthModalOpen(true)}
          onProfile={() => setProfileModalOpen(true)}
        />
      </header>

      {/* Main Body */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 container mx-auto px-4 pb-24 max-w-5xl"
      >
        {/* Page Title & Search Bar */}
        <div className="flex flex-col items-center text-center mt-8 mb-12 gap-6">
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-3xl font-serif font-extralight tracking-widest uppercase text-gray-800">Danh sách Light Novel</h2>
          </div>

          {/* Progress Summary */}
          <div className="flex items-center gap-2 text-xs text-pink-500/60 font-mono">
            <Heart className="w-3 h-3 text-pink-500" />
            <span>{volumes.length} Chính truyện</span>
            <span className="text-pink-300">|</span>
            <span>{watanareSideStories.length} Ngoại truyện</span>
          </div>

          {/* Tabs Navigation */}
          <div className="flex justify-center mt-2">
            <div className="relative bg-pink-50 backdrop-blur-md p-1.5 rounded-full border border-pink-200 flex items-center gap-1">
              <button
                onClick={() => setActiveTab("main")}
                className={`relative px-6 py-2 rounded-full text-xs font-bold font-mono tracking-widest uppercase transition-colors duration-300 z-10 cursor-pointer ${
                  activeTab === "main" ? "text-white" : "text-pink-500/60 hover:text-pink-600"
                }`}
              >
                {activeTab === "main" && (
                  <motion.div
                    layoutId="watanareActiveTab"
                    className="absolute inset-0 bg-pink-500 rounded-full shadow-[0_2px_10px_rgba(233,30,99,0.2)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  Chính truyện
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === "main" ? "bg-white/20 text-white" : "bg-pink-100 text-pink-500"
                  }`}>
                    {volumes.length}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab("side")}
                className={`relative px-6 py-2 rounded-full text-xs font-bold font-mono tracking-widest uppercase transition-colors duration-300 z-10 cursor-pointer ${
                  activeTab === "side" ? "text-white" : "text-pink-500/60 hover:text-pink-600"
                }`}
              >
                {activeTab === "side" && (
                  <motion.div
                    layoutId="watanareActiveTab"
                    className="absolute inset-0 bg-pink-500 rounded-full shadow-[0_2px_10px_rgba(233,30,99,0.2)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  Ngoại truyện
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === "side" ? "bg-white/20 text-white" : "bg-pink-100 text-pink-500"
                  }`}>
                    {watanareSideStories.length}
                  </span>
                </span>
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-pink-400/60" />
            <input
              type="text"
              placeholder="Tìm tập, tóm tắt, chương..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-pink-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm pl-10 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400 transition-all shadow-sm focus:shadow-[0_0_15px_rgba(233,30,99,0.1)]"
            />
          </div>
        </div>

        {/* View Mode: Compact (Grid of Covers) vs Detailed (List of Volume Panels) */}
        <AnimatePresence mode="wait">
          {viewMode === "detailed" ? (
            <motion.div
              key="detailed-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-10"
            >
              {filteredVolumes.map((vol) => (
                <div
                  key={vol.id}
                  className="bg-white border border-pink-100 hover:border-pink-300 rounded-2xl overflow-hidden shadow-lg backdrop-blur-xl transition-all duration-300 relative"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-300/30 to-transparent" />
                  
                  {/* Info and cover grid */}
                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_250px] divide-y md:divide-y-0 md:divide-x divide-pink-100">
                    
                    {/* Left Pane - Metadata and chapters list */}
                    <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-pink-600 font-bold uppercase tracking-widest">Tập {vol.volumeNumber}</span>
                          {vol.tag && (
                            <span className="bg-pink-100 text-pink-700 border border-pink-200 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                              {vol.tag}
                            </span>
                          )}
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500 font-mono">ISBN: {vol.isbn}</span>
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-gray-800 tracking-wide">{vol.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed font-serif font-light">{vol.synopsis}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-pink-600 border-t border-pink-100 pt-4">
                        <div className="flex items-center gap-1.5 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                          <span className="font-bold">Ngày Phát hành:</span>
                          <span className="text-gray-600">{vol.releaseDateJP}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                          <span className="font-bold">Tổng chương:</span>
                          <span className="text-gray-600">{(vol.toc || vol.chapters).length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Pane - Cover Image Card & Navigation */}
                    <div className="flex flex-col items-center justify-center p-6 bg-pink-50/30">
                      <div
                        onClick={() => setSelectedVolume(vol)}
                        className="relative w-full max-w-[140px] aspect-[2/3] shadow-lg rounded-lg border border-pink-100 overflow-hidden cursor-pointer transform hover:scale-[1.03] transition-transform duration-300"
                      >
                        <Image
                          src={vol.coverImage}
                          alt={vol.title}
                          fill
                          className="object-cover opacity-90 hover:opacity-100 transition-opacity"
                          sizes="140px"
                        />
                        {vol.inProgress && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center border-t border-pink-200">
                            <span className="text-pink-600 font-mono font-bold text-[10px] tracking-widest uppercase animate-pulse">Đang dịch</span>
                          </div>
                        )}
                        {progressMap[vol.id] && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-100 z-20">
                            <div
                              className="h-full bg-pink-500"
                              style={{ width: `${Math.min(100, Math.max(0, progressMap[vol.id].percentage * 100))}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="w-full mt-5 flex flex-col gap-2">
                        <Button
                          onClick={() => setSelectedVolume(vol)}
                          className="w-full bg-pink-100 hover:bg-pink-200 text-pink-700 border border-pink-200 font-serif font-bold text-xs tracking-wider cursor-pointer"
                        >
                          XEM NGAY
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="compact-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {filteredVolumes.map((vol) => (
                <div
                  key={vol.id}
                  onClick={() => setSelectedVolume(vol)}
                  className="flex flex-col gap-2.5 group cursor-pointer relative"
                >
                  <div className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-pink-100 relative z-10 bg-white">
                    {vol.tag && (
                      <div className="absolute top-2.5 right-2.5 bg-pink-100 text-pink-700 border border-pink-200 text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full z-20">
                        {vol.tag}
                      </div>
                    )}
                    <Image
                      src={vol.coverImage}
                      alt={vol.title}
                      fill
                      className="object-cover transition-transform duration-350 group-hover:scale-[1.03] opacity-90 group-hover:opacity-100"
                      sizes="(max-width: 768px) 50vw, 180px"
                    />
                    {vol.inProgress && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-center p-2 z-20">
                        <span className="text-pink-600 font-mono font-bold text-[9px] tracking-widest uppercase animate-pulse">Sắp ra mắt</span>
                      </div>
                    )}
                    {progressMap[vol.id] && (
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-pink-100 z-20">
                        <div
                          className="h-full bg-pink-500"
                          style={{ width: `${Math.min(100, Math.max(0, progressMap[vol.id].percentage * 100))}%` }}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-end justify-center pb-3 pointer-events-none">
                        <span className="bg-pink-600/90 text-white text-[9px] font-bold font-mono tracking-widest px-2.5 py-0.5 rounded-full shadow-md">
                        XEM
                      </span>
                    </div>
                  </div>

                  <div className="text-center mt-1 px-1">
                    <div className="font-bold text-gray-700 text-xs group-hover:text-pink-600 transition-colors truncate">
                      Tập {vol.volumeNumber}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate group-hover:text-gray-500 transition-colors">
                      {vol.title}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Volume Details Drawer / Overlay Modal */}
        <AnimatePresence>
          {selectedVolume && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-3xl max-h-[85vh] bg-white border border-pink-200 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.1)] overflow-y-auto p-6 md:p-8 flex flex-col md:grid md:grid-cols-[200px_1fr] gap-6 text-gray-900 select-text"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedVolume(null)}
                  className="absolute top-4 right-4 text-pink-500 hover:text-pink-700 hover:bg-pink-50 rounded-full p-2 w-10 h-10 flex items-center justify-center z-50 text-xl font-bold cursor-pointer transition-all"
                >
                  ✕
                </button>

                {/* Left Panel: Cover image and entry button */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-full max-w-[170px] aspect-[2/3] shadow-lg border border-pink-100 rounded-lg overflow-hidden">
                    <Image
                      src={selectedVolume.coverImage}
                      alt={selectedVolume.title}
                      fill
                      className="object-cover"
                      sizes="170px"
                    />
                  </div>
                  
                  <div className="w-full flex flex-col gap-2">
                    {selectedVolume.inProgress ? (
                      <Button disabled className="w-full bg-gray-100 text-gray-400 border border-gray-200 font-bold uppercase tracking-wider text-xs py-3 cursor-not-allowed">
                        ĐANG DỊCH
                      </Button>
                    ) : (
                      <Link href={`/watanare/read/${selectedVolume.id}/${selectedVolume.toc && selectedVolume.toc.length > 0 ? selectedVolume.toc[0].index : 1}`} className="w-full">
                        <Button className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold font-serif py-3 tracking-widest text-xs uppercase shadow-[0_4px_15px_rgba(233,30,99,0.2)] transition-all">
                          BẮT ĐẦU ĐỌC
                        </Button>
                      </Link>
                    )}
                  </div>

                  {progressMap[selectedVolume.id] && (
                    <div className="w-full bg-pink-50 border border-pink-100 rounded-xl p-3 text-center">
                      <div className="text-[10px] text-pink-600 font-bold tracking-wider uppercase mb-1">Đã đọc đến</div>
                      <div className="text-xs text-gray-700 font-medium truncate mb-1.5">{progressMap[selectedVolume.id].chapterTitle}</div>
                      <div className="w-full bg-pink-100 rounded-full h-1 overflow-hidden">
                        <div className="bg-pink-500 h-full rounded-full" style={{ width: `${progressMap[selectedVolume.id].percentage * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Panel: Metadata & Chapters TOC list with Grid / Detailed Toggle */}
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="font-serif text-3xl font-extralight text-gray-800 tracking-wide border-b border-pink-100 pb-2">{selectedVolume.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-pink-600 mt-2 font-mono uppercase tracking-widest">
                      <span>Tập {selectedVolume.volumeNumber}</span>
                      <span className="text-pink-300">|</span>
                      <span>{selectedVolume.id.startsWith("watanare-ss") ? "Ngoại truyện" : "Chính truyện"}</span>
                    </div>
                  </div>

                  {/* Synopsis */}
                  <div>
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-pink-600 mb-1.5">Tóm tắt</h4>
                    <p className="text-sm text-gray-600 leading-relaxed font-serif bg-pink-50/50 border border-pink-100 p-4 rounded-xl">{selectedVolume.synopsis}</p>
                  </div>

                  {/* Key Dates */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-pink-100">
                    <div>
                      <span className="text-pink-500/60 font-bold block mb-1 uppercase tracking-wider text-[9px] font-mono">Ngày phát hành JP</span>
                      <span className="text-gray-700 font-serif">{selectedVolume.releaseDateJP}</span>
                    </div>
                    <div>
                      <span className="text-pink-500/60 font-bold block mb-1 uppercase tracking-wider text-[9px] font-mono">Mã ISBN</span>
                      <span className="text-gray-700 font-serif">{selectedVolume.isbn}</span>
                    </div>
                  </div>

                  {/* Progress Tracking */}
                  <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-pink-600 font-bold tracking-wider uppercase">Tiến độ dịch</span>
                      <span className="text-xs text-pink-600 font-mono">
                        {selectedVolume.translationProgress !== undefined
                          ? selectedVolume.translationProgress === 0
                            ? "Chưa dịch"
                            : selectedVolume.translationProgress === 100
                              ? "Hoàn thành"
                              : "Đang dịch"
                          : selectedVolume.inProgress
                            ? "Đang dịch"
                            : "Hoàn thành"}
                      </span>
                    </div>
                    <div className="w-full bg-pink-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedVolume.translationProgress ?? (selectedVolume.inProgress ? 85 : 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {selectedVolume.translationProgress !== undefined
                        ? selectedVolume.translationProgress === 0
                          ? "Chưa có bản dịch. Hiện chỉ có bản gốc."
                          : selectedVolume.translationProgress === 100
                            ? "Tất cả chương đã có thể đọc."
                            : "Đang dịch các chương cuối. Hãy quay lại sau!"
                        : selectedVolume.inProgress
                          ? "Đang dịch các chương cuối. Hãy quay lại sau!"
                          : "Tất cả chương đã có thể đọc."}
                    </p>
                  </div>

                  {/* Chapters Section with Toggle */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-pink-100 pb-2">
                      <h4 className="font-bold text-[10px] uppercase tracking-widest text-pink-600">Danh sách chương</h4>
                      
                      {/* Grid / List View Toggle for Chapters */}
                      <div className="flex bg-gray-50 border border-pink-100 p-0.5 rounded-lg text-xs">
                        <button
                          onClick={() => setChaptersViewMode("grid")}
                          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${chaptersViewMode === "grid" ? "bg-pink-100 text-pink-700" : "text-gray-400 hover:text-gray-600"}`}
                          title="Dạng lưới"
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setChaptersViewMode("detailed")}
                          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${chaptersViewMode === "detailed" ? "bg-pink-100 text-pink-700" : "text-gray-400 hover:text-gray-600"}`}
                          title="Dạng danh sách"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {(() => {
                        const tocItems = selectedVolume.toc || [];
                        const chapterLabels = selectedVolume.chapters || [];
                        // Prefer translated chapter labels from data/watanare.ts over raw EPUB TOC
                        const items = tocItems.length > 0
                          ? tocItems.map((item, i) => ({ ...item, label: chapterLabels[i] || item.label }))
                          : chapterLabels.map((c, i) => ({ label: c, href: '', index: i + 1 }));
                        let chNum = 0;
                        const processedItems = items.map((item) => {
                          const lower = item.label.toLowerCase();
                          const isSpecial =
                            lower.includes("illustration") || lower.includes("イラスト") || lower.includes("minh họa") ||
                            lower.includes("afterword") || lower.includes("lời tác giả") ||
                            lower.includes("prologue") || lower.includes("lời mở đầu") || lower.includes("プロローグ") ||
                            lower.includes("epilogue") || lower.includes("lời kết") || lower.includes("エピローグ");
                          const hasExplicitNumber = /(?:chapter|chương|第)\s*(\d+(?:\.\d+)?)/i.test(item.label) || /^(\d+)[\.\:\s]/.test(item.label);
                          if (!isSpecial && !hasExplicitNumber) {
                            chNum++;
                          }
                          return { ...item, displayNumber: isSpecial ? null : (hasExplicitNumber ? null : chNum) };
                        });
                        return chaptersViewMode === "grid" ? (
                          <motion.div
                            key="chapters-grid"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pr-1"
                          >
                            {processedItems.map((item, i) => {
                              const label = getCompactChapterLabel(item.label, item.displayNumber);
                              return (
                                <Link key={i} href={`/watanare/read/${selectedVolume.id}/${item.index}`}>
                                  <div className="flex items-center justify-center p-3 text-center rounded-lg border border-pink-100 bg-gray-50 hover:bg-pink-50 hover:border-pink-200 text-xs font-serif text-gray-700 hover:text-pink-700 transition-all cursor-pointer truncate active:scale-95">
                                    {label}
                                  </div>
                                </Link>
                              );
                            })}
                          </motion.div>
                        ) : (
                          <motion.ul
                            key="chapters-list"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-gray-500 space-y-1.5 max-h-[200px] overflow-y-auto pr-2 border-l border-pink-100 pl-3.5"
                          >
                            {processedItems.map((item, i) => (
                              <li key={i} className="flex justify-between items-center py-1.5 border-b border-pink-50 last:border-b-0">
                                <span className="font-serif text-gray-700 pr-4">{item.label}</span>
                                <Link href={`/watanare/read/${selectedVolume.id}/${item.index}`}>
                                  <span className="text-[10px] text-pink-600 font-bold tracking-widest uppercase hover:underline cursor-pointer flex-shrink-0">Đọc →</span>
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Toggle Button (Volumes View Compact vs Detailed) */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <Button
          onClick={() => setViewMode(prev => prev === "detailed" ? "compact" : "detailed")}
          className="rounded-full w-14 h-14 bg-pink-600 hover:bg-pink-500 text-white shadow-[0_4px_20px_rgba(233,30,99,0.3)] border border-pink-400/20 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={viewMode}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === "detailed" ? <LayoutGrid className="w-6 h-6" /> : <List className="w-6 h-6" />}
            </motion.div>
          </AnimatePresence>
        </Button>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  );
}
