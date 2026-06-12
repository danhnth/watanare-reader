import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const shortcuts = [
    { key: ['←', 'H'], description: "Chương trước" },
    { key: ['→', 'L'], description: "Chương sau" },
    { key: ['M'], description: "Bật/tắt menu / danh sách chương" },
    { key: ['S'], description: "Bật/tắt cài đặt" },
    { key: ['T'], description: "Đổi chủ đề" },
    { key: ['F'], description: "Bật/tắt toàn màn hình" },
    { key: ['C'], description: "Mở bình luận" },
    { key: ['+', '-'], description: "Điều chỉnh cỡ chữ" },
    { key: ['/'], description: "Tìm kiếm (mở thanh bên)" },
    { key: ['Esc'], description: "Đóng menu" },
    { key: ['Ctrl', '/'], description: "Phím tắt" },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                                <Keyboard className="w-5 h-5 text-gray-500" />
                                Phím tắt
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100 text-gray-500">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="p-2 grid gap-1 max-h-[70vh] overflow-y-auto">
                            {shortcuts.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                                        {item.description}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {item.key.map((k, j) => (
                                            <React.Fragment key={j}>
                                                {j > 0 && (
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {item.key[0] === 'Ctrl' ? '+' : '/'}
                                                    </span>
                                                )}
                                                <kbd className="h-7 min-w-[1.75rem] px-2 flex items-center justify-center rounded bg-gray-100 border border-gray-300 text-xs font-sans font-bold text-gray-700 shadow-sm">
                                                    {k}
                                                </kbd>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                            <p className="text-xs text-gray-500">
                                Bấm <kbd className="bg-gray-100 px-1 rounded text-gray-600 font-mono border border-gray-200">Ctrl</kbd> + <kbd className="bg-gray-100 px-1 rounded text-gray-600 font-mono border border-gray-200">/</kbd> bất cứ lúc nào để bật/tắt menu này.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
