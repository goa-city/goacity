import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    MagnifyingGlassIcon, 
    XMarkIcon,
    UserCircleIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const debounceTimeout = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchResults = async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setResults(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
            setResults(res.data.data);
            setShowDropdown(true);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        
        if (val.trim().length >= 2) {
            setShowDropdown(true);
            setLoading(true);
            debounceTimeout.current = setTimeout(() => {
                fetchResults(val);
            }, 400); // 400ms debounce
        } else {
            setResults(null);
            setShowDropdown(false);
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults(null);
        setShowDropdown(false);
    };

    const handleNavigate = (path) => {
        navigate(path);
        clearSearch();
    };

    const hasResults = results && (
        results.members?.length > 0 || 
        results.meetings?.length > 0 || 
        results.pages?.length > 0 || 
        results.jobs?.length > 0
    );

    return (
        <div className="relative w-full max-w-lg z-50 text-left" ref={dropdownRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-5 w-5 ${showDropdown ? 'text-sky-500' : 'text-gray-400'}`} aria-hidden="true" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => { if (query.trim().length >= 2) setShowDropdown(true); }}
                    className={`block w-full pl-10 pr-10 py-3 border-none bg-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm transition-all duration-200 ${showDropdown ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'}`}
                    placeholder="Search people, meetings, pages..."
                />
                
                {/* Clear Button or Loading Spinner */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {loading ? (
                        <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin"></div>
                    ) : query.length > 0 && (
                        <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Dropdown Results */}
            {showDropdown && query.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 shadow-xl rounded-b-xl overflow-hidden max-h-[70vh] overflow-y-auto">
                    
                    {!loading && !hasResults && results && (
                        <div className="p-6 text-center text-gray-500 text-sm">
                            <p>No results found for "{query}"</p>
                        </div>
                    )}

                    {results && hasResults && (
                        <div className="py-2 divide-y divide-gray-50">
                            
                            {/* PEOPLE / MEMBERS */}
                            {results.members?.length > 0 && (
                                <div className="py-2">
                                    <h3 className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">People</h3>
                                    {results.members.map(member => (
                                        <div 
                                            key={member.id} 
                                            onClick={() => handleNavigate(`/profile/${member.id}`)}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                                {member.profile_photo ? (
                                                    <img src={member.profile_photo} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserCircleIcon className="w-6 h-6 text-gray-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {member.first_name} {member.last_name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{member.bio || member.role || 'Member'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* MEETINGS */}
                            {results.meetings?.length > 0 && (
                                <div className="py-2">
                                    <h3 className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Meetings</h3>
                                    {results.meetings.map(meeting => (
                                        <div 
                                            key={meeting.id} 
                                            onClick={() => handleNavigate(`/meetings`)}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                                                <CalendarDaysIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{meeting.title}</p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleDateString() : ''} 
                                                    {meeting.location_name ? ` • ${meeting.location_name}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* PAGES */}
                            {results.pages?.length > 0 && (
                                <div className="py-2">
                                    <h3 className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Pages & Resources</h3>
                                    {results.pages.map(page => (
                                        <div 
                                            key={page.id} 
                                            onClick={() => handleNavigate(`/${page.slug}`)}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                <DocumentTextIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{page.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                             {/* JOBS */}
                             {results.jobs?.length > 0 && (
                                <div className="py-2">
                                    <h3 className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Jobs</h3>
                                    {results.jobs.map(job => (
                                        <div 
                                            key={job.id} 
                                            onClick={() => job.url ? window.open(job.url, '_blank') : handleNavigate(`/jobs`)}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                                <BriefcaseIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{job.company}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
