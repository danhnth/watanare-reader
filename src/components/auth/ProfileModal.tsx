"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { X, User, Lock, Camera, Loader2, UploadCloud, LogOut, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user, signOut } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)


    const [username, setUsername] = useState("")
    const [isUsernameFixed, setIsUsernameFixed] = useState(false)
    const [password, setPassword] = useState("")
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [deleteStep, setDeleteStep] = useState(0)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setMounted(true)
        if (user) {
            fetchProfile()
        }
    }, [user, isOpen])

    const fetchProfile = async () => {
        if (!user) return
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', user.id)
                .single()

            if (data) {
                setUsername(data.username || "")

                const isEmailLike = data.username && data.username.includes('@')
                if (data.username && !isEmailLike) setIsUsernameFixed(true)

                setAvatarUrl(data.avatar_url)
            } else {

                const meta = user.user_metadata
                const fallback = meta?.username || meta?.full_name || meta?.name || user.email?.split('@')[0] || ""
                setUsername(fallback)

                setIsUsernameFixed(false)
                setAvatarUrl(meta?.avatar_url || null)
            }
        } catch (error) {

        }
    }

    const handleUpdateProfile = async () => {
        if (!user) return
        setLoading(true)
        setMessage(null)

        try {
            const updates = {
                id: user.id,
                username,
                updated_at: new Date().toISOString(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)
            if (error) throw error

            setMessage({ type: 'success', text: "Profile updated successfully!" })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async () => {
        if (!password.trim()) return
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setMessage({ type: 'success', text: "Password updated successfully!" })
            setPassword("")
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            setMessage(null)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`


            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true
                })

            if (uploadError) throw uploadError


            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)


            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user?.id,
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                })

            if (updateError) throw updateError

            setAvatarUrl(publicUrl)
            setMessage({ type: 'success', text: "Avatar uploaded!" })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setUploading(false)
        }
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
                        className="absolute inset-0 bg-black/30"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col z-[110] max-h-[85vh] overflow-hidden ring-1 ring-gray-100 m-4 sm:m-0"
                    >

                        <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800 font-serif flex items-center gap-2">
                                <User className="h-5 w-5 text-pink-500" />
                                Profile Settings
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>


                        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">


                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-100 text-green-600' : 'bg-red-50 border border-red-100 text-red-600'}`}
                                >
                                    {message.text}
                                </motion.div>
                            )}


                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative group">
                                    <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-pink-50 bg-gray-50 shadow-xl ring-1 ring-pink-100 group-hover:border-pink-100 transition-all">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                <User className="h-10 w-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 text-pink-500 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-pink-600 hover:underline font-medium flex items-center gap-1"
                                >
                                    <UploadCloud className="h-3 w-3" /> Change Avatar
                                </button>
                            </div>

                            <div className="h-px bg-gray-100 w-full" />


                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Identity</h3>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-600 flex justify-between">
                                        Display Name
                                        {isUsernameFixed && <span className="text-xs text-pink-500 flex items-center gap-1"><Lock className="h-3 w-3" /> Cannot be changed</span>}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={isUsernameFixed}
                                            className={`flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all ${isUsernameFixed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                            placeholder="Enter username"
                                        />
                                        {!isUsernameFixed && (
                                            <Button
                                                onClick={handleUpdateProfile}
                                                disabled={loading}
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                            >
                                                Save
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">This is how you appear in comments.</p>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 w-full" />


                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Security</h3>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-600">New Password</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all hover:bg-gray-100"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleUpdatePassword}
                                            disabled={loading || !password}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                        >
                                            Update
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 w-full" />


                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Session</h3>
                                <Button
                                    onClick={() => {
                                        signOut()
                                        onClose()
                                    }}
                                    variant="outline"
                                    className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 justify-start"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>


                            <div className="h-px bg-gray-100 w-full" />


                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Danger Zone</h3>

                                {deleteStep === 0 && (
                                    <>
                                        <p className="text-xs text-gray-400">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                        <Button
                                            onClick={() => setDeleteStep(1)}
                                            variant="ghost"
                                            className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 justify-start"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </>
                                )}

                                {deleteStep === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-3"
                                    >
                                        <p className="text-sm text-red-700 font-medium">Are you absolutely sure?</p>
                                        <p className="text-xs text-red-600/70">
                                            This action cannot be undone. This will permanently delete your account, reading progress, and comments.
                                        </p>
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setDeleteStep(0)}
                                                className="flex-1 bg-transparent border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => setDeleteStep(2)}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none"
                                            >
                                                Yes, continue
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {deleteStep === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-3"
                                    >
                                        <p className="text-sm text-red-700">
                                            Type <span className="font-bold text-gray-800">DELETE</span> to confirm.
                                        </p>
                                        <input
                                            type="text"
                                            value={deleteConfirmText}
                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                            className="w-full bg-white border border-red-200 rounded-lg p-2.5 text-sm text-gray-900 placeholder-red-300 focus:outline-none focus:border-red-400 transition-colors"
                                            placeholder="Type DELETE"
                                        />
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setDeleteStep(0)
                                                    setDeleteConfirmText("")
                                                }}
                                                className="flex-1 bg-transparent border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                disabled={deleteConfirmText !== 'DELETE'}
                                                onClick={async () => {
                                                    setLoading(true)
                                                    try {
                                                        const { error } = await supabase.rpc('delete_user')
                                                        if (error) throw error

                                                        await signOut()
                                                        onClose()
                                                        window.location.reload()
                                                    } catch (error: any) {

                                                        const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));

                                                        if (errorMessage.includes('function') && (errorMessage.includes('not found') || errorMessage.includes('Could not find'))) {
                                                            alert("System Error: The deletion feature hasn't been enabled on the database yet. Please contact the administrator (or run the SQL script).")
                                                        } else if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
                                                            alert("System Error: Database tables are missing. Please run the 'Fix Database' SQL script.")
                                                        } else {
                                                            alert("Error deleting account: " + errorMessage)
                                                        }
                                                        setLoading(false)
                                                    }
                                                }}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Confirm Delete
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
