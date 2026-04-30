import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    HandRaisedIcon,
    XMarkIcon,
    NewspaperIcon,
    ChevronLeftIcon,
    HeartIcon,
    ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '../shared/components/ui/Card';
import Button from '../shared/components/ui/Button';
import { formatDate } from '../utils/date';
import { getProfilePhotoUrl } from '../utils/image';

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    profile_photo?: string;
    job_title?: string;
    role?: string;
    bio?: string;
    businesses?: Array<{
        business_name: string;
        industry?: string;
        website?: string;
        business_type?: string;
    }>;
    profile_attributes?: Array<{ label: string; value: any }>;
    services?: Array<{ id: number; title: string; type: string; description: string }>;
    posts?: any[];
}

const PublicProfile: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);

    // Collaboration Request Modal State
    const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
    const [collabType, setCollabType] = useState('Paid');
    const [collabDesc, setCollabDesc] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [slug]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/member/profile/${slug}`);
            setMember(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCollabRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!member) return;
        setSubmitting(true);
        try {
            await api.post('/member/collaboration/request', {
                provider_id: member.id,
                type: collabType,
                description: collabDesc
            });
            alert('Collaboration requested successfully! Pending Admin Approval.');
            setIsCollabModalOpen(false);
        } catch (error) {
            console.error('Request failed:', error);
            alert('Failed to request collaboration.');
        } finally {
            setSubmitting(false);
            setCollabDesc('');
        }
    };

    const renderAttributeValue = (value: any) => {
        if (!value) return '-';

        // Handle Arrays (Multi-select)
        let displayValue = value;
        if (Array.isArray(value)) {
            displayValue = value.join(', ');
        } else if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) displayValue = parsed.join(', ');
            } catch (e) { }
        }

        const valStr = String(displayValue);

        // Handle URLs
        if (valStr.startsWith('http://') || valStr.startsWith('https://') || valStr.startsWith('www.')) {
            const href = valStr.startsWith('www.') ? `https://${valStr}` : valStr;
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 break-all"
                >
                    {valStr}
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            );
        }

        return <span className="break-words">{valStr}</span>;
    };

    if (loading) return (
        <DashboardLayout>
            <div className="py-40 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Loading Profile...</p>
            </div>
        </DashboardLayout>
    );

    if (!member) return (
        <DashboardLayout>
            <div className="text-center py-40">
                <div className="text-zinc-300 dark:text-zinc-700 font-black text-6xl uppercase italic tracking-tighter mb-4 opacity-20">404</div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-2">Member Not Found</h2>
                <p className="text-zinc-500 font-medium">The member mapping requested could not be resolved.</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Back Link */}
                <Link to="/my-people" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-12 group">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                        <ChevronLeftIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Directory</span>
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        {/* Square Profile Photo */}
                        <div className="w-32 h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center text-4xl font-black shrink-0 overflow-hidden shadow-xl">
                            {member.profile_photo ? (
                                <img src={getProfilePhotoUrl(member.profile_photo)} alt={member.first_name} className="w-full h-full object-cover" />
                            ) : (
                                `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`
                            )}
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
                                {member.first_name} {member.last_name}
                            </h1>
                            <div className="mt-2 flex flex-col gap-0.5">
                                {member.phone && (
                                    <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{member.phone}</p>
                                )}
                                {member.email && (
                                    <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{member.email}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsCollabModalOpen(true)}
                        className="w-full md:w-auto rounded-xl px-8 py-3.5 shadow-lg shadow-indigo-600/10 font-black uppercase tracking-widest text-[10px]"
                    >
                        <HandRaisedIcon className="w-4 h-4 mr-2" />
                        Propose Collaboration
                    </Button>
                </div>

                {/* Member Profile - Identity Matrix */}
                <div className="mb-6 px-2">
                    <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Member Profile</h2>
                </div>

                <Card className="rounded-2xl border-none shadow-2xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden mb-20">
                    <CardContent className="p-10 md:p-14">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            {member.profile_attributes && member.profile_attributes.length > 0 ? (
                                member.profile_attributes
                                    .filter(attr => !['profile photo', 'profile_photo'].includes(attr.label.toLowerCase()))
                                    .map((attr, i) => (
                                        <div key={i} className="group border-b border-zinc-50 dark:border-zinc-800/50 pb-6 last:border-0 md:[&:nth-last-child(2)]:border-0 md:last:border-0">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block group-hover:text-indigo-500 transition-colors">
                                                {attr.label}
                                            </label>
                                            <div className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                                                {renderAttributeValue(attr.value)}
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <p className="col-span-2 text-zinc-400 font-medium italic">No profile attributes defined for this member.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Bio / Short Story */}
                {member.bio && (
                    <div className="mb-20 px-4 md:px-10 border-l-4 border-indigo-600">
                        <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed italic">
                            "{member.bio}"
                        </p>
                    </div>
                )}

                {/* Marketplace / Services */}
                {member.services && member.services.length > 0 && (
                    <div className="mb-20">
                        <div className="flex items-center gap-3 mb-10">
                            <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.4em]">Services & Offerings</h2>
                            <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {member.services.map((srv) => (
                                <Card key={srv.id} className="group rounded-[2rem] border-none shadow-xl shadow-zinc-100 dark:shadow-none p-10 hover:shadow-2xl transition-all bg-white dark:bg-zinc-900/50">
                                    <div className="mb-6">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${srv.type === 'Paid'
                                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                            }`}>
                                            {srv.type}
                                        </span>
                                    </div>
                                    <h4 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic mb-4 tracking-tight">{srv.title}</h4>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-8">
                                        {srv.description || 'Offers specialized collaboration and services in this area.'}
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setCollabType(srv.type);
                                            setIsCollabModalOpen(true);
                                        }}
                                        className="w-full rounded-2xl py-4"
                                    >
                                        Inquire Service
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* News Updates */}
                <div className="mb-32">
                    <div className="flex items-center gap-3 mb-10">
                        <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.4em]">Latest News</h2>
                        <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
                    </div>
                    <div className="space-y-10">
                        {member.posts && member.posts.length > 0 ? (
                            member.posts.map((post) => (
                                <Card key={post.id} className="rounded-2xl border-none shadow-xl shadow-zinc-200/30 dark:shadow-none overflow-hidden bg-white dark:bg-zinc-900">
                                    <CardContent className="p-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shadow-sm">
                                                {member.profile_photo ? (
                                                    <img src={getProfilePhotoUrl(member.profile_photo)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-zinc-400 uppercase">
                                                        {member.first_name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Posted {formatDate(post.created_at)}</p>
                                            </div>
                                        </div>
                                        <p className="text-lg text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap mb-8">
                                            {post.content}
                                        </p>
                                        {post.media_url && (
                                            <div className="rounded-3xl overflow-hidden mb-8 border border-zinc-50 dark:border-zinc-800">
                                                <img src={post.media_url} alt="" className="w-full h-auto max-h-[500px] object-cover" />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-8">
                                            <button className="flex items-center gap-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-500 transition-colors group">
                                                <HeartIcon className="w-5 h-5 group-hover:fill-red-500 group-hover:stroke-red-500 transition-all" />
                                                <span>Impact</span>
                                            </button>
                                            <button className="flex items-center gap-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                                                <ChatBubbleLeftIcon className="w-5 h-5" />
                                                <span>Join Conversation</span>
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="p-24 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <NewspaperIcon className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-6" />
                                <p className="text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em] italic">No recent updates shared</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Collab Request Modal */}
            {isCollabModalOpen && (
                <div className="fixed inset-0 bg-zinc-950/80 z-[100] flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 relative">
                        <button
                            onClick={() => setIsCollabModalOpen(false)}
                            className="absolute top-8 right-8 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <div className="p-10 md:p-12">
                            <div className="mb-10">
                                <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight italic">Initiate Collaboration</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 font-medium italic mt-1">Connect with <span className="text-zinc-900 dark:text-white font-bold">{member.first_name}</span> for specialized work.</p>
                            </div>

                            <form onSubmit={handleCollabRequest} className="space-y-8">
                                <div className="bg-zinc-50 dark:bg-zinc-800/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 ml-1">Collab Framework</label>
                                    <div className="flex flex-wrap gap-8">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="Paid"
                                                checked={collabType === 'Paid'}
                                                onChange={e => setCollabType(e.target.value)}
                                                className="appearance-none w-5 h-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700 checked:border-indigo-500 checked:border-[6px] transition-all cursor-pointer"
                                            />
                                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-500 transition-colors">Commercial Service</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="Gifted"
                                                checked={collabType === 'Gifted'}
                                                onChange={e => setCollabType(e.target.value)}
                                                className="appearance-none w-5 h-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700 checked:border-indigo-500 checked:border-[6px] transition-all cursor-pointer"
                                            />
                                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-500 transition-colors">Kingdom Partnership</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">Objective & Scope</label>
                                    <textarea
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl p-6 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-zinc-900 dark:text-white font-medium leading-relaxed min-h-[160px] shadow-inner"
                                        required
                                        placeholder="Describe the project vision or specific service requirements..."
                                        value={collabDesc}
                                        onChange={e => setCollabDesc(e.target.value)}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl shadow-2xl hover:bg-indigo-600 dark:hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {submitting ? 'Transmitting Proposal...' : 'Commit Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default PublicProfile;



