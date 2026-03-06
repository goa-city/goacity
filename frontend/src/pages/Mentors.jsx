import { useState, useEffect } from 'react';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Mentors = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [areas, setAreas] = useState('');
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [requestForm, setRequestForm] = useState({ duration: 'Short-term', goal: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                // Fetch directory and filter those willing to mentor
                // Assuming directory API returns basic profile fields including willing_to_mentor
                const res = await api.get('/members/directory');
                let allMembers = res.data.data || [];
                // Check if they are willing to mentor - adjusting based on generic profile mapping you might have
                const filterMentors = allMembers.filter(m => m.willing_to_mentor || m.role === 'mentor'); // Fallback if exact flag varies
                // For demonstration, if none found, we mock or just show all if we want to debug
                setMentors(filterMentors);
            } catch (err) {
                console.error("Failed to fetch mentors", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMentors();
    }, []);

    const handleSearch = (e) => setSearch(e.target.value.toLowerCase());

    const openModal = (mentor) => {
        setSelectedMentor(mentor);
        setRequestForm({ duration: 'Short-term', goal: '' });
        setIsModalOpen(true);
    };

    const submitRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/mentorship/request', {
                mentor_id: selectedMentor.id,
                type: requestForm.duration,
                focus_area: areas || 'General Mentorship',
                goals: [{ text: requestForm.goal, completed: false }]
            });
            alert('Mentorship requested successfully!');
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to request mentorship');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredMentors = mentors.filter(m => 
        (m.first_name + ' ' + m.last_name).toLowerCase().includes(search) ||
        (m.business_name || '').toLowerCase().includes(search)
    );

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#2D2D46]">Request Form for Mentorship</h1>
                <p className="text-gray-500 mt-2">Find and connect with mentors in our community.</p>
            </div>

            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                    <input 
                        type="text" 
                        placeholder="Search by name or company..." 
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                </div>
                <input 
                    type="text" 
                    placeholder="Mentoring Area (e.g. Leadership)" 
                    onChange={e => setAreas(e.target.value)}
                    className="w-1/3 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : filteredMentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMentors.map(m => (
                        <div key={m.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full mb-4 flex items-center justify-center text-indigo-500 text-2xl font-bold">
                                {m.first_name?.[0]}{m.last_name?.[0]}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{m.first_name} {m.last_name}</h3>
                            <p className="text-sm text-gray-500">{m.business_name || 'Business Leader'}</p>
                            <p className="text-xs text-sky-600 bg-sky-50 px-2 py-1 rounded-full mt-2">Willing to Mentor</p>
                            
                            <button 
                                onClick={() => openModal(m)}
                                className="mt-6 w-full px-6 py-2.5 bg-[#2D2D46] hover:bg-gray-800 text-white rounded-xl transition-colors text-sm font-bold shadow-md inline-flex items-center justify-center gap-2"
                            >
                                Request Mentorship
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No mentors found matching your criteria.</p>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Mentorship</h2>
                        <p className="text-gray-500 mb-6">with {selectedMentor?.first_name} {selectedMentor?.last_name}</p>
                        
                        <form onSubmit={submitRequest}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={requestForm.duration}
                                    onChange={e => setRequestForm({...requestForm, duration: e.target.value})}
                                >
                                    <option>Short-term</option>
                                    <option>Long-term</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Goal</label>
                                <textarea 
                                    required
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                                    rows="3"
                                    value={requestForm.goal}
                                    onChange={e => setRequestForm({...requestForm, goal: e.target.value})}
                                    placeholder="What do you hope to achieve?"
                                ></textarea>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-6 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors text-sm shadow-md inline-flex items-center justify-center gap-2">
                                    {submitting ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
export default Mentors;
