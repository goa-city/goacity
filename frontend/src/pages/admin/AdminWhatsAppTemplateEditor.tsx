import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    ChatBubbleLeftRightIcon, CheckIcon, VariableIcon, PhotoIcon, XMarkIcon
} from '@heroicons/react/24/solid';
import { ArrowLeftIcon as ArrowLeftOutline } from '@heroicons/react/24/outline';
import { Card, CardContent } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import Input from '../../shared/components/ui/Input';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { FaceSmileIcon } from '@heroicons/react/24/outline';

interface TemplateFormData {
    title: string;
    content: string;
    image_url_display?: string | null;
}

const AdminWhatsAppTemplateEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = id && id !== 'create';

    const [loading, setLoading] = useState(!!isEdit);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [formData, setFormData] = useState<TemplateFormData>({
        title: '',
        content: '',
        image_url_display: null
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeExistingImage, setRemoveExistingImage] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEdit) {
            fetchTemplate();
        }
    }, [id]);

    const showToast = (msg: string): void => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const fetchTemplate = async () => {
        try {
            const res = await api.get(`/admin/whatsapp-templates/${id}`);
            setFormData({
                title: res.data.title || '',
                content: res.data.content || '',
                image_url_display: res.data.image_url_display || null
            });
            if (res.data.image_url_display) {
                setImagePreview(res.data.image_url_display);
            }
        } catch (error) {
            console.error("Failed to fetch template:", error);
            showToast("Failed to load template");
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showToast("Please select an image file (JPG, PNG, WebP)");
                return;
            }
            if (file.size > 15 * 1024 * 1024) {
                showToast("Image size must be under 15MB");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setRemoveExistingImage(false);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setRemoveExistingImage(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);

            if (imageFile) {
                data.append('image', imageFile);
            } else if (removeExistingImage) {
                data.append('remove_image', 'true');
            }

            if (isEdit) {
                await api.put(`/admin/whatsapp-templates/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast("Template updated successfully");
            } else {
                await api.post('/admin/whatsapp-templates', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast("Template created successfully");
            }
            setTimeout(() => navigate('/admin/whatsapp/templates'), 1000);
        } catch (error) {
            console.error("Failed to save template:", error);
            showToast("Failed to save template");
        } finally {
            setSaving(false);
        }
    };

    const insertAtCursor = (text: string): void => {
        const textarea = textareaRef.current;
        if (!textarea) {
            setFormData(prev => ({ ...prev, content: prev.content + text }));
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const content = formData.content;
        
        const newContent = content.substring(0, start) + text + content.substring(end);
        
        setFormData(prev => ({
            ...prev,
            content: newContent
        }));

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + text.length, start + text.length);
        }, 0);
    };

    const insertVariable = (variable: string): void => {
        insertAtCursor(`{${variable}}`);
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        insertAtCursor(emojiData.emoji);
    };

    if (loading) return <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 animate-pulse">Loading editor...</div>;

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 font-sans relative">
            {toast && (
                <div className="fixed bottom-10 right-10 bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] font-black uppercase text-[10px] tracking-widest animate-in fade-in slide-in-from-bottom-4">
                    {toast}
                </div>
            )}
            <div className="flex justify-between items-center mb-8">
                <button 
                    onClick={() => navigate('/admin/whatsapp/templates')} 
                    className="flex items-center text-zinc-500 hover:text-zinc-800 transition-colors group"
                >
                    <ArrowLeftOutline className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform stroke-[1.5]" />
                    <span className="text-xl font-medium">Back to Templates</span>
                </button>
                <div className="flex gap-3">
                    <Button onClick={handleSave} isLoading={saving} className="px-8 shadow-xl shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 border-none">
                        <CheckIcon className="w-4 h-4 mr-2" /> {isEdit ? 'Update Template' : 'Save Template'}
                    </Button>
                </div>
            </div>

            <div className="mb-10">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3 italic">
                    {isEdit ? 'Edit Template' : 'Create Template'}
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-emerald-600" />
                </h1>
                <p className="text-zinc-500 mt-2 font-medium">Design your reusable WhatsApp message with optional photo</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-zinc-100 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50">
                        <CardContent className="p-8 space-y-6">
                            <Input 
                                label="Template Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Event Confirmation"
                                className="bg-zinc-50 dark:bg-zinc-950 font-bold"
                                required
                            />

                            {/* Image / Photo Attachment */}
                            <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <PhotoIcon className="w-5 h-5 text-emerald-600" />
                                        <span className="text-xs font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-200">
                                            Template Photo / Image (Optional)
                                        </span>
                                    </div>
                                    {imagePreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="inline-flex items-center gap-1 text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                            Remove Photo
                                        </button>
                                    )}
                                </div>

                                {imagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-64 flex items-center justify-center bg-black/5 dark:bg-black/20 group">
                                        <img 
                                            src={imagePreview} 
                                            alt="Template Attachment" 
                                            className="max-h-64 w-auto object-contain rounded-xl shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all shadow-md"
                                            title="Remove photo"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <input 
                                            ref={fileInputRef}
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden" 
                                            id="template-image-upload"
                                        />
                                        <label 
                                            htmlFor="template-image-upload"
                                            className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-6 cursor-pointer transition-colors text-center group bg-white dark:bg-zinc-900"
                                        >
                                            <PhotoIcon className="w-8 h-8 text-zinc-400 group-hover:text-emerald-600 transition-colors mb-2" />
                                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                                                Click to upload an image flyer or poster
                                            </span>
                                            <span className="text-[10px] text-zinc-400 font-medium mt-1">
                                                PNG, JPG, WebP up to 15MB. Sent with your message caption on WhatsApp.
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500">Message Content</label>
                                    
                                    <Popover className="relative">
                                        <PopoverButton className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-all text-[10px] font-black uppercase tracking-widest outline-none">
                                            <FaceSmileIcon className="w-4 h-4" />
                                            Add Emoji
                                        </PopoverButton>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-200"
                                            enterFrom="opacity-0 translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition ease-in duration-150"
                                            leaveFrom="opacity-100 translate-y-0"
                                            leaveTo="opacity-0 translate-y-1"
                                        >
                                            <PopoverPanel className="absolute right-0 z-50 mt-3 shadow-2xl">
                                                <EmojiPicker 
                                                    onEmojiClick={onEmojiClick}
                                                    autoFocusSearch={false}
                                                    theme={Theme.AUTO}
                                                    width={350}
                                                    height={400}
                                                />
                                            </PopoverPanel>
                                        </Transition>
                                    </Popover>
                                </div>
                                <textarea 
                                    ref={textareaRef}
                                    className="w-full h-64 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium leading-relaxed font-mono text-sm"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Type your message here..."
                                    required
                                />
                                <p className="mt-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Supports WhatsApp formatting: *bold*, _italic_, ~strikethrough~</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <VariableIcon className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400">Insert Variables</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'first_name', label: 'first_name' },
                                    { key: 'last_name', label: 'last_name' },
                                    { key: 'meeting_title', label: 'meeting_title' },
                                    { key: 'meeting_date', label: 'meeting_date' },
                                    { key: 'meeting_time', label: 'meeting_time' },
                                    { key: 'location_name', label: 'location_name' },
                                    { key: 'map_link', label: 'map_link' },
                                    { key: 'zoom_link', label: 'zoom_link' },
                                    { key: 'rsvp_link', label: 'rsvp_link (single URL)' },
                                    { key: 'rsvp_options_link', label: 'rsvp_options_link (3 options)' },
                                    { key: 'upi_link', label: 'upi_link (Payment Page)' },
                                    { key: 'pay_link', label: 'pay_link (Payment Page)' }
                                ].map(v => (
                                    <button 
                                        key={v.key}
                                        type="button"
                                        onClick={() => insertVariable(v.key)}
                                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                    >
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 p-3 bg-white/60 dark:bg-zinc-900/60 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40 text-[10px] space-y-1.5 text-zinc-600 dark:text-zinc-400">
                                <p><strong>{"{rsvp_link}"}</strong>: Points to meeting page.</p>
                                <p><strong>{"{rsvp_options_link}"}</strong>: Inserts 3 lines (Going, Maybe, No) with member ID attached to automatically record RSVP when clicked.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <CardContent className="p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 italic">Live Preview</h3>
                            <div className="bg-emerald-100/50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-800/50 relative space-y-3">
                                <div className="absolute left-[-8px] top-4 w-4 h-4 bg-emerald-100/50 dark:bg-emerald-900/20 rotate-45 border-l border-b border-emerald-200/50 dark:border-emerald-800/50" />
                                
                                {imagePreview && (
                                    <div className="rounded-xl overflow-hidden border border-emerald-200/60 dark:border-emerald-800/60 max-h-48 flex items-center justify-center bg-black/5">
                                        <img src={imagePreview} alt="Preview Attachment" className="max-h-48 w-auto object-contain rounded-xl" />
                                    </div>
                                )}

                                <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed font-medium">
                                    {formData.content
                                        ? formData.content
                                            .replace(/\{rsvp_options_link\}/g, "*Going:* https://goa.city/meeting/r/r_9a2f1b8c\n\n*Maybe:* https://goa.city/meeting/r/r_3d7e5a1f\n\n*No:* https://goa.city/meeting/r/r_6b8c4e2d")
                                            .replace(/\{rsvp_link\}/g, "https://goa.city/meetings/september_meeting")
                                        : 'Your message preview will appear here...'}
                                </p>
                                <p className="text-[10px] text-zinc-400 mt-2 text-right">09:41 AM</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminWhatsAppTemplateEditor;
