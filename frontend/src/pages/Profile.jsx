import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon, ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/solid';
import GoaLandscape from '../components/GoaLandscape';

const Profile = () => {
    const { user: authUser, setUser: setAuthUser } = useAuth(); // To update auth context if needed
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
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
    const [previewUrl, setPreviewUrl] = useState(null);
    const [extendedProfile, setExtendedProfile] = useState({});

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
                    profile_photo: null // Reset file input
                });
                if (p.profile_photo) {
                    setPreviewUrl(`http://localhost:8000/${p.profile_photo}`);
                }
                setExtendedProfile(p.extended_profile || {});
            } catch (error) {
                console.error("Failed to load profile", error);
                alert("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, profile_photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            await api.post('/member/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Profile updated successfully!");
            // Optionally update context user to reflect changes immediately
            // setAuthUser({ ...authUser, full_name: formData.full_name, ... }); 
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <button onClick={() => navigate('/dashboard')} className="mr-4 text-gray-500 hover:text-gray-700">
                                <ArrowLeftIcon className="h-6 w-6" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-4xl py-10 px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    
                    <div className="space-y-8 divide-y divide-gray-200">
                        <div>
                            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                
                                {/* Photo Upload */}
                                <div className="sm:col-span-6 flex items-center gap-6">
                                    <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <UserCircleIcon className="h-16 w-16 text-gray-300" />
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="profile_photo" className="block text-sm font-medium text-gray-700">Photo</label>
                                        <div className="mt-1 flex items-center">
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                            >
                                                <span>Change Photo</span>
                                                <input id="file-upload" name="profile_photo" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">JPG, PNG, GIF up to 5MB</p>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="full_name" className="block text-sm font-medium leading-6 text-gray-900">Full Name</label>
                                    <div className="mt-2">
                                        <input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">Phone</label>
                                    <div className="mt-2">
                                        <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="dob" className="block text-sm font-medium leading-6 text-gray-900">Date of Birth</label>
                                    <div className="mt-2">
                                        <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="gender" className="block text-sm font-medium leading-6 text-gray-900">Gender</label>
                                    <div className="mt-2">
                                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="village" className="block text-sm font-medium leading-6 text-gray-900">Village/City</label>
                                    <div className="mt-2">
                                        <input type="text" name="village" id="village" value={formData.village} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">Address</label>
                                    <div className="mt-2">
                                        <textarea id="address" name="address" rows={3} value={formData.address} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                                    </div>
                                </div>

                                <div className="sm:col-span-4">
                                    <label htmlFor="linkedin_url" className="block text-sm font-medium leading-6 text-gray-900">LinkedIn URL</label>
                                    <div className="mt-2">
                                        <input type="url" name="linkedin_url" id="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <label htmlFor="bio" className="block text-sm font-medium leading-6 text-gray-900">Bio</label>
                                    <div className="mt-2">
                                        <textarea id="bio" name="bio" rows={4} value={formData.bio} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">Write a few sentences about yourself.</p>
                                </div>
                            </div>
                        </div>

                        {/* Extended Profile Display (Read Only for now) */}
                        {Object.keys(extendedProfile).length > 0 && (
                            <div className="pt-8">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">Additional Profile Information</h3>
                                <p className="mt-1 text-sm text-gray-500">Collected from your onboarding forms.</p>
                                <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    {Object.entries(extendedProfile).map(([key, value]) => (
                                        <div key={key} className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                                            <dd className="mt-1 text-sm text-gray-900 break-words">
                                                {Array.isArray(value) ? value.join(', ') : (typeof value === 'object' ? JSON.stringify(value) : value)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}
                    </div>

                    <div className="pt-5">
                        <div className="flex justify-end gap-x-3">
                            <button type="button" onClick={() => navigate('/dashboard')} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </main>

            {/* Footer Background */}
            <div className="fixed bottom-0 left-0 w-full z-0 pointer-events-none flex justify-center">
                 <GoaLandscape className="w-full max-w-4xl h-auto opacity-20 dark:opacity-10 text-slate-600 dark:text-slate-400" />
            </div>
        </div>
    );
};

export default Profile;
