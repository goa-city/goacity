import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../features/auth/context/AuthContext';
import { UserCircleIcon, ArrowLeftIcon, CameraIcon } from '@heroicons/react/24/solid';
import GoaLandscape from '../components/GoaLandscape';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useToast } from '../hooks/useToast';
import ToastDisplay from '../components/ToastDisplay';

interface ProfileFormData {
    full_name: string;
    phone: string;
    dob: string;
    gender: string;
    village: string;
    address: string;
    linkedin_url: string;
    bio: string;
    profile_photo: File | null;
}

const Profile: React.FC = () => {
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    const isNative = Capacitor.isNativePlatform();
    const { toast, showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: '',
        phone: '',
        dob: '',
        gender: '',
        village: '',
        address: '',
        linkedin_url: '',
        bio: '',
        profile_photo: null
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extendedProfile, setExtendedProfile] = useState<Record<string, any>>({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/member/profile');
                const p = res.data;
                setFormData({
                    full_name: p.full_name || '',
                    phone: p.phone || '',
                    dob: p.dob || '',
                    gender: p.gender || '',
                    village: p.village || '',
                    address: p.address || '',
                    linkedin_url: p.linkedin_url || '',
                    bio: p.bio || '',
                    profile_photo: null
                });
                if (p.profile_photo) {
                    setPreviewUrl(p.profile_photo);
                }
                setExtendedProfile(p.extended_profile || {});
            } catch (error) {
                console.error("Failed to load profile", error);
                showToast('Failed to load profile.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [showToast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNativePhoto = async () => {
        try {
            const photo = await Camera.getPhoto({
                quality: 80,
                allowEditing: true,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Prompt,
                promptLabelHeader: 'Profile Photo',
                promptLabelPhoto: 'Choose from Gallery',
                promptLabelPicture: 'Take Photo',
            });

            if (photo.dataUrl) {
                const res = await fetch(photo.dataUrl);
                const blob = await res.blob();
                const file = new File([blob], 'profile_photo.jpg', { type: 'image/jpeg' });
                setFormData(prev => ({ ...prev, profile_photo: file }));
                setPreviewUrl(photo.dataUrl);
            }
        } catch (err: any) {
            if (err.message && !err.message.toLowerCase().includes('cancel')) {
                console.error('Camera error', err);
                showToast('Could not access camera.', 'error');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, profile_photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        (Object.keys(formData) as Array<keyof ProfileFormData>).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key] as any);
            }
        });

        try {
            await api.post('/member/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            console.error("Failed to update profile", error);
            showToast('Failed to update profile.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-zinc-950">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20 font-sans selection:bg-indigo-500 selection:text-white">
            <ToastDisplay toast={toast} />
            
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-30">
                <div className="mx-auto max-w-4xl px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all group">
                            <ArrowLeftIcon className="h-6 w-6 group-hover:-translate-x-1 transition-transform stroke-[2px]" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">My Profile</h1>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Identity Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Authenticated</span>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-4xl py-12 px-6">
                <form onSubmit={handleSubmit} className="space-y-12">
                    
                    {/* Identity Section */}
                    <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 md:p-12 shadow-2xl border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
                        
                        <div className="relative space-y-10">
                            {/* Photo Upload */}
                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative h-32 w-32 rounded-full overflow-hidden bg-zinc-50 dark:bg-zinc-800 border-4 border-white dark:border-zinc-800 shadow-2xl flex items-center justify-center">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Profile" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <UserCircleIcon className="h-20 w-20 text-zinc-200 dark:text-zinc-700" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={isNative ? handleNativePhoto : () => document.getElementById('file-upload')?.click()}
                                        className="absolute bottom-1 right-1 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-zinc-900"
                                    >
                                        <CameraIcon className="w-5 h-5" />
                                    </button>
                                    {!isNative && <input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />}
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Profile Image</h3>
                                    <p className="text-xs text-zinc-400 font-medium mt-1">Recommended size: 400x400px. JPG or PNG.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-2">Display Identity</label>
                                    <input 
                                        type="text" name="full_name" value={formData.full_name} onChange={handleChange} 
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-2">Phone</label>
                                    <input 
                                        type="text" name="phone" value={formData.phone} onChange={handleChange} 
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                                        placeholder="+91..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-2">Date of Birth</label>
                                    <input 
                                        type="date" name="dob" value={formData.dob} onChange={handleChange} 
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-2">Gender</label>
                                    <select 
                                        name="gender" value={formData.gender} onChange={handleChange} 
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-2">Village / City</label>
                                    <input 
                                        type="text" name="village" value={formData.village} onChange={handleChange} 
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                                        placeholder="Panjim, Margao, etc."
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-2">Full Address</label>
                                    <textarea 
                                        name="address" rows={3} value={formData.address} onChange={handleChange} 
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none" 
                                        placeholder="Mailing address..."
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-2">LinkedIn Profile</label>
                                    <input 
                                        type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} 
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-2">Brief Bio</label>
                                    <textarea 
                                        name="bio" rows={4} value={formData.bio} onChange={handleChange} 
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none" 
                                        placeholder="Write something about yourself..."
                                    />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">This will be visible on your public profile.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Extended Profile Section */}
                    {Object.keys(extendedProfile).length > 0 && (
                        <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 md:p-12 shadow-xl border border-zinc-100 dark:border-zinc-800">
                            <div className="mb-10">
                                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Onboarding Data</h3>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Supplemental Information</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {Object.entries(extendedProfile).map(([key, value]) => (
                                    <div key={key} className="space-y-1">
                                        <dt className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">{key.replace(/_/g, ' ')}</dt>
                                        <dd className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 break-words">
                                            {Array.isArray(value) ? value.join(', ') : (typeof value === 'object' ? JSON.stringify(value) : String(value))}
                                        </dd>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                        <button 
                            type="button" 
                            onClick={() => navigate('/dashboard')} 
                            className="px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        >
                            Discard
                        </button>
                        <button 
                            type="submit" 
                            disabled={saving} 
                            className="group relative px-12 py-5 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden"
                        >
                            <span className="relative z-10">{saving ? "Syncing Identity..." : "Commit Changes"}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </button>
                    </div>
                </form>
            </main>

            {/* Footer Decoration */}
            <div className="fixed bottom-0 left-0 w-full z-0 pointer-events-none flex justify-center opacity-10">
                 <GoaLandscape className="w-full max-w-4xl h-auto text-zinc-900 dark:text-white" />
            </div>
        </div>
    );
};

export default Profile;
