"use client"

import { useEffect, useState, useRef, memo } from "react"
import { X, Send, Image as ImageIcon, Bold, Italic, Link as LinkIcon, AlertTriangle, Trash2, ExternalLink, ArrowUp, ArrowDown, Smile, Command, LogOut, MessageSquare, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"

interface CustomCommentsProps {
    isOpen: boolean
    onClose: () => void
    volumeId: string
    chapterTitle: string
    onSignInRequest: () => void
}

interface ReactionData {
    upvotes: number
    downvotes: number
    user_reaction: 'upvote' | 'downvote' | null
}

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    parent_id: string | null
    profiles: {
        username: string
        avatar_url: string | null
    }
    children?: Comment[]
    reactions: ReactionData
}


function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return "vừa xong";
}

const getAvatarColor = (name: string) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}


const CommentContent = memo(({ content }: { content: string }) => {
    const lines = content.split('\n');
    return (
        <div className="space-y-1">
            {lines.map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                const parts = line.split(/(>!.*?!<|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)|https?:\/\/\S+|\*\*.*?\*\*|\*.*?\*)/g);
                return (
                    <div key={i} className="min-h-[1.2em] break-words">
                        {parts.map((part, j) => {
                            if (part.startsWith('>!') && part.endsWith('!<')) {
                                return <span key={j} className="bg-gray-200 text-gray-200 hover:text-gray-700 rounded px-1.5 py-0.5 cursor-pointer select-none transition-colors duration-200" title="Click to reveal spoiler">{part.slice(2, -2)}</span>
                            }
                            if (part.match(/^!\[.*?\]\(.*?\)$/)) {
                                const match = part.match(/^!\[(.*?)\]\((.*?)\)$/);
                                if (match) return <img key={j} src={match[2]} alt={match[1]} className="max-w-full rounded-md border border-gray-200 my-2 max-h-[500px] object-contain bg-gray-50" loading="lazy" decoding="async" />;
                            }
                            if (part.match(/^\[.*?\]\(.*?\)$/)) {
                                const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
                                if (match) return <a key={j} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline inline-flex items-baseline gap-0.5">{match[1]} <ExternalLink className="h-3 w-3 self-center" /></a>;
                            }
                            if (part.match(/^https?:\/\//)) {
                                return <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline break-all">{part}</a>;
                            }
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
                            }
                            if (part.startsWith('*') && part.endsWith('*')) {
                                return <em key={j} className="italic text-gray-600">{part.slice(1, -1)}</em>;
                            }
                            return <span key={j}>{part}</span>;
                        })}
                    </div>
                );
            })}
        </div>
    );
});
CommentContent.displayName = "CommentContent";

const TimelineItem = ({
    comment,
    user,
    onDelete,
    onReply,
    onVote,
    replyingToId,
    submitReply,
    replyContent,
    setReplyContent,
    replyLoading,
    isChild = false,
    depth = 0
}: any) => {
    const isMe = user?.id === comment.user_id;
    const isCreator = ['nithinspacetime1', 'NITHINSPACETIME'].includes(comment.profiles?.username || '');
    const username = comment.profiles?.username?.split('@')[0] || "User";
    const avatarColor = getAvatarColor(username);
    const initials = username.substring(0, 2).toUpperCase();

    const bubbleBg = isChild ? "bg-white" : "bg-white";
    const headerBg = isCreator ? "bg-gray-50" : "bg-white";

    return (
        <div className={`relative flex gap-2 sm:gap-3 ${isChild ? 'mt-4' : 'mb-6'}`}>

            <div className="flex flex-col items-center flex-shrink-0 z-10 w-[32px] sm:w-[40px]">
                {comment.profiles?.avatar_url ? (
                    <img
                        src={comment.profiles.avatar_url}
                        alt={username}
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover shadow-sm ring-1 ring-gray-200 bg-white"
                    />
                ) : (
                    <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-white text-[10px] sm:text-[12px] font-bold shadow-sm ring-1 ring-gray-200 ${avatarColor}`}>
                        {initials}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="border border-gray-200 rounded-md relative group bg-white shadow-sm">
                    <div className="absolute top-[14px] -left-[6px] w-3 h-3 bg-white border-l border-b border-gray-200 transform rotate-45 hidden sm:block"></div>

                    <div className={`flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2 border-b border-gray-100 ${headerBg} rounded-t-md relative z-[1]`}>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className={`text-xs sm:text-sm font-bold truncate ${isCreator ? 'text-gray-900' : 'text-gray-700'}`}>{username}</span>
                            <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">{timeAgo(comment.created_at)}</span>
                            {isCreator && (
                                <span className="border border-pink-200 bg-pink-50 text-pink-600 text-[10px] px-1.5 py-0.5 rounded font-medium ml-2 inline-block">
                                    Người tạo
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isMe && (
                                <button onClick={() => onDelete(comment.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                            )}
                        </div>
                    </div>


                    <div className="p-3 sm:p-4 bg-white text-gray-700 text-[13px] sm:text-[14px] leading-relaxed rounded-b-md overflow-x-auto">
                        <CommentContent content={comment.content} />
                    </div>


                    <div className="px-4 py-2 bg-white border-t border-gray-100 rounded-b-md flex items-center gap-4">
                        <div className="flex items-center gap-0.5 border border-gray-200 rounded-full bg-gray-50 overflow-hidden">
                            <button onClick={() => onVote(comment.id, 'upvote')} className={`px-2 py-1 text-xs hover:bg-gray-100 transition-colors flex items-center gap-1 ${comment.reactions.user_reaction === 'upvote' ? 'text-blue-600 bg-gray-100' : 'text-gray-500'}`}>
                                <ArrowUp className="h-3.5 w-3.5" /> {comment.reactions.upvotes > 0 && comment.reactions.upvotes}
                            </button>
                            <div className="w-[1px] h-4 bg-gray-200"></div>
                            <button onClick={() => onVote(comment.id, 'downvote')} className={`px-2 py-1 text-xs hover:bg-gray-100 transition-colors flex items-center gap-1 ${comment.reactions.user_reaction === 'downvote' ? 'text-red-600 bg-gray-100' : 'text-gray-500'}`}>
                                <ArrowDown className="h-3.5 w-3.5" /> {comment.reactions.downvotes > 0 && comment.reactions.downvotes}
                            </button>
                        </div>

                        <button
                            onClick={() => onReply(replyingToId === comment.id ? null : comment.id)}
                            className="text-xs text-gray-500 hover:text-pink-500 flex items-center gap-1 ml-auto"
                        >
                            <MessageSquare className="h-3.5 w-3.5" /> Trả lời
                        </button>
                    </div>
                </div>


                {replyingToId === comment.id && (
                    <div className="mt-3 ml-2 border border-gray-200 rounded-md bg-white animate-in fade-in zoom-in-95 duration-200 shadow-sm">

                        <div className="p-2">
                            <textarea
                                className="w-full bg-transparent text-gray-700 text-sm p-2 focus:outline-none resize-y min-h-[80px]"
                                placeholder={`Reply to @${username}...`}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="ghost" size="sm" onClick={() => onReply(null)} className="h-7 text-xs text-gray-600 hover:text-gray-900">Hủy</Button>
                                <Button onClick={() => submitReply(comment.id)} disabled={replyLoading || !replyContent.trim()} size="sm" className="bg-pink-600 hover:bg-pink-700 text-white h-7 text-xs">Trả lời</Button>
                            </div>
                        </div>
                    </div>
                )}


                {comment.children && comment.children.length > 0 && (
                    <div className={`mt-2 pl-0 ${depth < 8 ? 'border-l-[1px] border-gray-200/50' : 'border-l-0'} ml-0.5`}>

                        <div className={`${depth < 8 ? 'pl-1.5' : 'pl-0'}`}>
                            {comment.children.map((child: any) => (
                                <TimelineItem
                                    key={child.id}
                                    comment={child}
                                    user={user}
                                    onDelete={onDelete}
                                    onReply={onReply}
                                    onVote={onVote}
                                    replyingToId={replyingToId}
                                    submitReply={submitReply}
                                    replyContent={replyContent}
                                    setReplyContent={setReplyContent}
                                    replyLoading={replyLoading}
                                    isChild={true}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}



export function CustomComments({ isOpen, onClose, volumeId, chapterTitle, onSignInRequest }: CustomCommentsProps) {
    const { user, signOut } = useAuth()
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
    const [sortOrder, setSortOrder] = useState<'oldest' | 'newest'>('newest')


    const [replyingToId, setReplyingToId] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState("")
    const [replyLoading, setReplyLoading] = useState(false)


    const buildCommentTree = (flatComments: any[], reactionsMap: any) => {
        const commentMap: any = {};
        const roots: any[] = [];
        flatComments.forEach(c => {
            const reaction = reactionsMap[c.id] || { upvotes: 0, downvotes: 0, user_reaction: null };
            commentMap[c.id] = { ...c, children: [], reactions: reaction };
        });
        flatComments.forEach(c => {
            if (c.parent_id) {
                if (commentMap[c.parent_id]) {
                    commentMap[c.parent_id].children.push(commentMap[c.id]);
                }
            } else {
                roots.push(commentMap[c.id]);
            }
        });
        return roots;
    };

    const fetchComments = async () => {
        const { data: commentsData } = await supabase
            .from('comments')
            .select('id, content, created_at, user_id, parent_id, profiles (username, avatar_url)')
            .eq('volume_id', volumeId)
            .eq('chapter_title', chapterTitle)
            .order('created_at', { ascending: true });

        if (!commentsData) return;

        const commentIds = commentsData.map(c => c.id);
        const { data: reactionsData } = await supabase.from('comment_reactions').select('*').in('comment_id', commentIds);

        const reactionsMap: any = {};
        if (reactionsData) {
            reactionsData.forEach((r: any) => {
                if (!reactionsMap[r.comment_id]) reactionsMap[r.comment_id] = { upvotes: 0, downvotes: 0, user_reaction: null };
                if (r.reaction_type === 'upvote') reactionsMap[r.comment_id].upvotes++;
                if (r.reaction_type === 'downvote') reactionsMap[r.comment_id].downvotes++;

                if (user && r.user_id === user.id) {
                    reactionsMap[r.comment_id].user_reaction = r.reaction_type;
                }
            });
        }

        const tree = buildCommentTree(commentsData, reactionsMap);
        const sortedRoots = tree.sort((a: any, b: any) => {
            const d1 = new Date(a.created_at).getTime()
            const d2 = new Date(b.created_at).getTime()
            return sortOrder === 'newest' ? d2 - d1 : d1 - d2
        });

        setComments(sortedRoots);
    }

    useEffect(() => {
        if (!isOpen) return;

        fetchComments();

        const channel = supabase
            .channel('public:comments_github_v3')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchComments())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_reactions' }, () => fetchComments())
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [isOpen, volumeId, chapterTitle, sortOrder, user?.id]);


    const handlePost = async () => {
        if (!newComment.trim()) return;
        if (!user) {
            onSignInRequest();
            return;
        }
        setLoading(true);


        const optimisticId = crypto.randomUUID();
        const optimisticComment: Comment = {
            id: optimisticId,
            content: newComment,
            created_at: new Date().toISOString(),
            user_id: user.id,
            parent_id: null,
            profiles: {
                username: user.email?.split('@')[0] || 'User',
                avatar_url: user.user_metadata?.avatar_url || null
            },
            children: [],
            reactions: { upvotes: 0, downvotes: 0, user_reaction: null }
        };

        setComments(prev => [optimisticComment, ...prev]);
        setNewComment("");

        try {
            await supabase.from('comments').insert({
                user_id: user.id,
                volume_id: volumeId,
                chapter_title: chapterTitle,
                content: optimisticComment.content,
                parent_id: null
            });
            await fetchComments();
        } catch (e) {

            setComments(prev => prev.filter(c => c.id !== optimisticId));
        } finally {
            setLoading(false);
        }
    };

    const submitReply = async (parentId: string) => {
        if (!replyContent.trim()) return;
        if (!user) {
            onSignInRequest();
            return;
        }
        setReplyLoading(true);


        const optimisticId = crypto.randomUUID();
        const optimisticReply: Comment = {
            id: optimisticId,
            content: replyContent,
            created_at: new Date().toISOString(),
            user_id: user.id,
            parent_id: parentId,
            profiles: {
                username: user.email?.split('@')[0] || 'User',
                avatar_url: user.user_metadata?.avatar_url || null
            },
            children: [],
            reactions: { upvotes: 0, downvotes: 0, user_reaction: null }
        };

        setComments(prev => {
            const addReply = (list: any[]): any[] => {
                return list.map(c => {
                    if (c.id === parentId) {
                        return { ...c, children: [...(c.children || []), optimisticReply] };
                    }
                    if (c.children) {
                        return { ...c, children: addReply(c.children) };
                    }
                    return c;
                });
            };
            return addReply(prev);
        });

        setReplyContent("");
        setReplyingToId(null);

        try {
            await supabase.from('comments').insert({
                user_id: user.id,
                volume_id: volumeId,
                chapter_title: chapterTitle,
                content: optimisticReply.content,
                parent_id: parentId
            });
            await fetchComments();
        } catch (e) {


            fetchComments();
        } finally {
            setReplyLoading(false);
        }
    };

    const handleVote = async (commentId: string, type: 'upvote' | 'downvote') => {
        if (!user) {
            onSignInRequest();
            return;
        }


        setComments(prevComments => {
            const updateRecursively = (list: any[]): any[] => {
                return list.map(c => {
                    if (c.id === commentId) {
                        const currentReaction = c.reactions.user_reaction;
                        let newUpvotes = c.reactions.upvotes;
                        let newDownvotes = c.reactions.downvotes;
                        let newReaction = null;

                        if (currentReaction === type) {

                            if (type === 'upvote') newUpvotes--;
                            if (type === 'downvote') newDownvotes--;
                        } else {

                            if (currentReaction === 'upvote') newUpvotes--;
                            if (currentReaction === 'downvote') newDownvotes--;

                            if (type === 'upvote') newUpvotes++;
                            if (type === 'downvote') newDownvotes++;
                            newReaction = type;
                        }

                        return { ...c, reactions: { upvotes: newUpvotes, downvotes: newDownvotes, user_reaction: newReaction } };
                    }
                    if (c.children) {
                        return { ...c, children: updateRecursively(c.children) };
                    }
                    return c;
                });
            };
            return updateRecursively(prevComments);
        });


        try {
            const { data: existing } = await supabase.from('comment_reactions').select('id, reaction_type').eq('user_id', user.id).eq('comment_id', commentId).single();

            if (existing) {
                if (existing.reaction_type === type) {
                    await supabase.from('comment_reactions').delete().eq('id', existing.id);
                } else {
                    await supabase.from('comment_reactions').update({ reaction_type: type }).eq('id', existing.id);
                }
            } else {
                await supabase.from('comment_reactions').insert({ user_id: user.id, comment_id: commentId, reaction_type: type });
            }
        } catch (error) {


            fetchComments();
        }
    };

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null)

    const confirmDelete = (commentId: string) => {
        setCommentToDelete(commentId)
        setDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        if (!commentToDelete) return;

        const idToDelete = commentToDelete;
        setDeleteModalOpen(false);
        setCommentToDelete(null);


        setComments(prevComments => {
            const removeRecursively = (list: any[]): any[] => {
                return list.filter(c => c.id !== idToDelete).map(c => {
                    if (c.children) {
                        return { ...c, children: removeRecursively(c.children) };
                    }
                    return c;
                });
            };
            return removeRecursively(prevComments);
        });

        try {
            const { error } = await supabase.from('comments').delete().eq('id', idToDelete);
            if (error) throw error;
        } catch (e: any) {

            alert(`Failed to delete comment: ${e.message}`);
            fetchComments();
        }
    }

    const insertMarkdown = (syntax: string) => { setNewComment(prev => prev + syntax); };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />}
            <div className={`fixed right-0 top-0 bottom-0 w-full sm:w-[600px] bg-white border-l border-gray-200 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col font-sans ${isOpen ? "translate-x-0" : "translate-x-full"}`}>


                <div className="flex border-b border-gray-200 bg-gray-50 px-6 py-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-gray-900 font-bold text-lg">{comments.reduce((acc, c) => acc + 1 + (c.children?.length || 0) + (c.children?.reduce((a, b) => a + (b.children?.length || 0), 0) || 0), 0)} bình luận</h2>
                    </div>
                    <div className="flex bg-gray-200 rounded-md p-0.5">
                        <button onClick={() => setSortOrder('oldest')} className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${sortOrder === 'oldest' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500'}`}>Cũ nhất</button>
                        <button onClick={() => setSortOrder('newest')} className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${sortOrder === 'newest' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500'}`}>Mới nhất</button>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100"><X className="h-4 w-4" /></Button>
                </div>


                <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar bg-white">
                    {comments.map(comment => (
                        <TimelineItem
                            key={comment.id}
                            comment={comment}
                            user={user}
                            onDelete={confirmDelete}
                            onReply={setReplyingToId}
                            onVote={handleVote}
                            replyingToId={replyingToId}
                            submitReply={submitReply}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            replyLoading={replyLoading}
                            depth={0}
                        />
                    ))}
                    {comments.length === 0 && (
                        <div className="text-center text-gray-400 py-10 opacity-50">
                            <Send className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p>Chưa có bình luận nào.</p>
                        </div>
                    )}
                </div>


                <div className="p-3 bg-white border-t border-gray-200 z-20">
                    <div className="border border-gray-200 rounded-md bg-white mb-0 relative group focus-within:ring-1 focus-within:ring-pink-400/40">

                        <div className="flex items-center gap-1 px-2 pt-1.5 border-b border-gray-100 bg-gray-50 rounded-t-md">
                            <button onClick={() => setActiveTab('write')} className={`px-2.5 py-1.5 text-xs font-medium rounded-t-md border border-transparent ${activeTab === 'write' ? 'bg-white border-gray-200 border-b-white text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}>Viết</button>
                            <button onClick={() => setActiveTab('preview')} className={`px-2.5 py-1.5 text-xs font-medium rounded-t-md border border-transparent ${activeTab === 'preview' ? 'bg-white border-gray-200 border-b-white text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}>Xem trước</button>
                        </div>

                        <div className="bg-white rounded-b-md min-h-[80px] flex flex-col">
                            {activeTab === 'write' && (
                                <div className="flex items-center gap-1 border-b border-dashed border-gray-200/50 p-1 px-2">
                                    {[{ icon: Bold, syntax: '**bold**' }, { icon: Italic, syntax: '*italic*' }, { icon: LinkIcon, syntax: '[text](url)' }, { icon: ImageIcon, syntax: '![alt](url)' }, { icon: AlertTriangle, syntax: '>! spoiler !<' }].map(({ icon: Icon, syntax }, i) => (
                                        <button key={i} onClick={() => insertMarkdown(syntax)} className="p-1 text-gray-400 hover:text-pink-500 hover:bg-gray-50 rounded"><Icon className="h-3.5 w-3.5" /></button>
                                    ))}
                                </div>
                            )}
                            {activeTab === 'write' ? (
                                <textarea className="w-full h-full bg-transparent text-gray-700 text-sm p-3 focus:outline-none resize-y placeholder:text-gray-400 min-h-[60px]" placeholder="Viết bình luận" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                            ) : (
                                <div className="p-3 text-sm text-gray-700 min-h-[60px]">{newComment.trim() ? <CommentContent content={newComment} /> : <span className="text-gray-400 italic">Không có gì để xem trước</span>}</div>
                            )}
                            <div className="flex justify-end p-2 bg-white rounded-b-md">
                                <Button onClick={handlePost} disabled={loading || !newComment.trim()} size="sm" className="bg-pink-600 hover:bg-pink-700 text-white font-semibold h-6 px-3 text-xs">Bình luận</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {deleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
                    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-2xl p-6 transform transition-all scale-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa bình luận?</h3>
                        <p className="text-gray-500 text-sm mb-6">Bạn có chắc muốn xóa bình luận này? Hành động này không thể hoàn tác.</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100" onClick={() => setDeleteModalOpen(false)}>Hủy</Button>
                            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>Xóa</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
