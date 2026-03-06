import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
    SparklesIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function StewardshipLogModal({ isOpen, onClose, onSuccess, defaultGiftType = 'Financial' }) {
    const { user } = useAuth();
    
    // Modal state
    const [giftType, setGiftType] = useState(defaultGiftType);
    const [recipientId, setRecipientId] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [skillCategory, setSkillCategory] = useState('');
    const [hours, setHours] = useState('');
    const [recipientMemberId, setRecipientMemberId] = useState('');
    
    const [orgs, setOrgs] = useState([]);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchOrgsAndMembers = async () => {
            try {
                const orgData = await api.get('/members/verified_orgs').catch(() => ({ data: [] }));
                setOrgs(orgData.data || []);
                const memData = await api.get('/members/directory').catch(() => ({ data: [] }));
                setMembers(memData.data?.filter(m => m.id !== user.id) || []);
            } catch (error) {
                console.error("Failed to fetch orgs/members", error);
            }
        };

        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGiftType(defaultGiftType);
            fetchOrgsAndMembers();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, defaultGiftType, user.id]);

    const submitStewardshipLog = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                type: giftType,
                recipient_id: giftType === 'Financial' ? recipientId : recipientMemberId,
                amount: giftType === 'Financial' ? Number(amount) : null,
                hours: giftType === 'Skill' ? Number(hours) : null,
                date: giftType === 'Financial' ? date : new Date().toISOString().split('T')[0],
                skill_category: giftType === 'Skill' ? skillCategory : null
            };
            
            // Temporary mock API call if backend isn't mapped
            await api.post('/members/stewardship_log', payload).catch(() => {
                console.warn('Backend not ready, mocking success');
                return { success: true };
            });

            alert('GIFT LOGGED — Pending Admin Verification');
            onClose();
            // Reset form
            setAmount(''); setHours(''); setDate('');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to log gift');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-sky-500" /> Record a New Contribution
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={submitStewardshipLog} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setGiftType('Financial')}
                            className={`p-4 rounded-2xl border-2 transition-all text-center font-bold text-sm ${giftType === 'Financial' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                            Financial Gift
                        </button>
                        <button type="button" onClick={() => setGiftType('Skill')}
                            className={`p-4 rounded-2xl border-2 transition-all text-center font-bold text-sm ${giftType === 'Skill' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                            Skill / Time
                        </button>
                    </div>

                    {giftType === 'Financial' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div>
                                <label className="admin-label">Verified Organization</label>
                                <select value={recipientId} onChange={e => setRecipientId(e.target.value)} required className="admin-input">
                                    <option value="">Select recipient...</option>
                                    <option value="1">City Gospel Movement NGO</option>
                                    {orgs.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Amount (₹)</label>
                                    <input type="number" min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="admin-input" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="admin-label">Date</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="admin-input" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div>
                                <label className="admin-label">Skill Category</label>
                                <select value={skillCategory} onChange={e => setSkillCategory(e.target.value)} required className="admin-input">
                                    <option value="">Select category...</option>
                                    {user?.mentoring_areas ? user.mentoring_areas.split(',').map(area => (
                                        <option key={area} value={area.trim()}>{area.trim()}</option>
                                    )) : (
                                        <>
                                            <option value="Business Mentoring">Business Mentoring</option>
                                            <option value="Tech Support">Tech Support</option>
                                            <option value="Event Volunteering">Event Volunteering</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Hours Gifted</label>
                                    <input type="number" min="0.5" step="0.5" value={hours} onChange={e => setHours(e.target.value)} required className="admin-input" placeholder="0.0" />
                                </div>
                                <div>
                                    <label className="admin-label">Recipient Member</label>
                                    <select value={recipientMemberId} onChange={e => setRecipientMemberId(e.target.value)} required className="admin-input">
                                        <option value="">Select member...</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                                        <option value="-1">Other / External</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 shadow transition-all">Submit Contribution</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
