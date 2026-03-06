import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { CheckCircleIcon, DocumentTextIcon, LinkIcon } from '@heroicons/react/24/outline';
import Onboarding from './Onboarding';

const MeetingView = () => {
    const { id } = useParams();
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);

    const isDev = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';

    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const res = await api.get(`/meetings/${id}`);
                setMeeting(res.data);
            } catch (err) {
                console.error("Failed to load meeting details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMeeting();
    }, [id]);

    const handleDevTest = async () => {
        setMeeting(prev => ({ ...prev, checked_in: 1 }));
        alert("ACCESS GRANTED — Resources now visible\nADMIN CHECK — Verify submission appears in /admin/meetings/" + id);
        try {
            if (meeting.feedback_form_id) {
                await api.post('/member/submit-form', {
                    form_id: meeting.feedback_form_id,
                    meeting_id: meeting.id,
                    test_field: "Test Meeting Response"
                });
                alert("FORM SUBMITTED — Response linked to Meeting ID: " + id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <DashboardLayout><div className="p-10 text-center">Loading...</div></DashboardLayout>;
    if (!meeting) return <DashboardLayout><div className="p-10 text-center">Meeting not found</div></DashboardLayout>;

    const hasCheckedIn = meeting.checked_in === 1;

    return (
        <DashboardLayout>
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2D2D46]">{meeting.title}</h1>
                    <p className="text-gray-500 mt-2">{meeting.meeting_date} at {meeting.location_name}</p>
                </div>
                {isDev && (
                    <button onClick={handleDevTest} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md font-bold text-sm">
                        Simulate Check-in & Form
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-xl font-bold mb-4">Meeting Description</h2>
                <p className="text-gray-700">{meeting.description || "No description provided."}</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6 text-indigo-500" />
                    Resources
                </h2>
                {!hasCheckedIn ? (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                        <CheckCircleIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <h3 className="text-lg font-bold text-gray-700">Check-In Required</h3>
                        <p className="text-gray-500 mt-1">Please check in to this meeting to access available resources.</p>
                    </div>
                ) : (
                    <div>
                        {meeting.resources && meeting.resources.length > 0 ? (
                            <ul className="space-y-3">
                                {meeting.resources.map((res) => (
                                    <li key={res.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <LinkIcon className="w-5 h-5 text-gray-400" />
                                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:underline">
                                            {res.title}
                                        </a>
                                        <span className="text-xs text-gray-400 uppercase tracking-widest bg-gray-200 px-2 py-1 rounded">{res.type}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No resources have been added for this meeting yet.</p>
                        )}
                    </div>
                )}
            </div>

            {meeting.feedback_form_id && hasCheckedIn && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#2D2D46] mb-4">Complete Feedback/Meeting Form</h2>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative" style={{minHeight: '600px'}}>
                        {/* We use an iframe to embed the onboarding UI for the specific form, or use a component.
                            Since Onboarding holds its own state and layout, it's easier to pass formId as prop if refactored.
                            Here we just render the Onboarding component but it currently uses useParams, so we link to it instead.
                        */}
                        <div className="p-8 text-center bg-gray-50">
                            <DocumentTextIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold">This meeting requires a feedback submission.</h3>
                            <a href={`/onboarding/form/${meeting.feedback_form_id}?meeting_id=${meeting.id}`} className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
                                Open Form
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default MeetingView;
