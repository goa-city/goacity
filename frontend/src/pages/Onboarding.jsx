import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ArrowRightIcon, ChevronLeftIcon, CloudArrowUpIcon, ChevronRightIcon, SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import GoaLandscape from '../components/GoaLandscape';

const Onboarding = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState(1);
    const [isDark, setIsDark] = useState(false);
    const inputRef = useRef(null);
    
    const { formId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [fetchingForm, setFetchingForm] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        // Identity
        full_name: user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : ''),
        dob: '',
        gender: '',
        address: '',
        village: '',
        
        // Business
        business_name: '',
        business_type: '',
        industry: '',
        years_in_operation: '',
        employees_count: '',
        website: '',
        business_summary: '',
        
        // Professional
        professional_role: '',
        specialisation: '',
        skills: [],
        
        // Faith
        mentoring_interest: '',
        mentoring_areas: '',
        share_testimony: false,
        conduct_workshop: false,
        spiritual_gifts: '',
        
        // Community
        support_interest_types: [],
        target_support_group: '',
        struggles_overcome: '',
        
        // Needs & Offers
        business_needs: [],
        marketplace_offers: [],
        
        // Extras
        profile_photo: null, 
        linkedin_url: '',
        awards: '',
        challenges_overcome: ''
    });

    const [photoPreview, setPhotoPreview] = useState(null);

    // Initialize Theme
    useEffect(() => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDark(true);
        }
    }, []);

    // Apply Theme
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    useEffect(() => {
        // Only redirect compulsorily if we are on the main onboarding flow (no formId)
        // and the user is already onboarded.
        if (!formId && user && user.is_onboarded == 1) {
             navigate('/dashboard');
        }
    }, [user, navigate, formId]);

    useEffect(() => {
        if (inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 300);
        }
    }, [currentStep]);

    // Goa Villages/Towns List
    const goaLocations = [
        "Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", 
        "Calangute", "Candolim", "Anjuna", "Siolim", "Assagao", "Parra",
        "Saligao", "Bambolim", "Dona Paula", "Old Goa", "Merces", "Santa Cruz",
        "Taleigao", "Caranzalem", "Miramar", "Ribandar", "Corlim", "Cortalim",
        "Verna", "Nuvem", "Fatorda", "Navelim", "Benaulim", "Colva", "Varca",
        "Cavelossim", "Canacona", "Chaudi", "Sanvordem", "Curchorem", "Sanguem",
        "Quepem", "Bicholim", "Sanquelim", "Valpoi", "Pernem", "Mandrem", "Arambol",
        "Morjim", "Other"
    ];

    // Skills List
    const skillsList = [
        "Leadership", "Strategic Thinking", "Finance Management", "Budgeting / Forecasting",
        "People Development", "Team Building", "Conflict Resolution", "Sales & Negotiation",
        "Branding", "Marketing", "Digital / Tech Skills", "Operations & Process Building",
        "Project Management", "Supply Chain", "Product Development", "Legal & Compliance",
        "Public Speaking", "Mentoring & Coaching", "Creativity & Innovation", "Problem Solving",
        "Crisis Management", "Networking Strength", "Fundraising / Investor Relations",
        "Social Impact / Community Work"
    ];

    // Helper to evaluate conditions
    const checkCondition = (condition, data) => {
        if (!condition) return true;
        // Simple condition logic: field, operator, value
        // e.g. { field: 'mentoring_interest', operator: 'neq', value: 'No' }
        const { field, operator, value } = condition;
        const fieldValue = data[field];

        if (operator === 'eq') return fieldValue === value;
        if (operator === 'neq') return fieldValue !== value;
        if (operator === 'contains') return fieldValue?.includes(value);
        return true;
    };

    const filteredQuestions = questions.filter(q => checkCondition(q.conditions, formData));
    const currentQ = filteredQuestions[currentStep];

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = new FormData();
            
            // Standardize payload construction
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value instanceof File) {
                    payload.append(key, value);
                } else if (typeof value === 'object' && value !== null) {
                    payload.append(key, JSON.stringify(value));
                } else {
                    payload.append(key, value);
                }
            });

            let endpoint = '/member/onboarding';
            if (formId) {
                endpoint = '/member/submit-form';
                payload.append('form_id', formId);
            }

            await api.post(endpoint, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Redirect based on context
            if (formId) {
                navigate('/dashboard'); 
            } else {
                 // Main profile onboarding
                 navigate('/dashboard'); 
            }
            
        } catch (error) {
            console.error("Submission failed", error);
            // Handle error (show toast etc)
        } finally {
            setLoading(false);
        }
    };

    const saveProgress = async () => {
        try {
             const payload = new FormData();
            Object.keys(formData).forEach(key => {
                 const value = formData[key];
                if (value instanceof File) {
                     // Don't auto-save files usually, or handle carefully
                     // payload.append(key, value);
                } else if (typeof value === 'object' && value !== null) {
                    payload.append(key, JSON.stringify(value));
                } else {
                    payload.append(key, value);
                }
            });
            
            payload.append('is_partial', '1');

             let endpoint = '/member/onboarding';
            if (formId) {
                endpoint = '/member/submit-form';
                 payload.append('form_id', formId);
            }

            await api.post(endpoint, payload, {
                 headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log("Progress saved");
        } catch (error) {
            console.error("Auto-save failed", error);
        }
    };
    const handleNext = async () => {
        // Validation check
        if (currentQ.is_required && !currentQ.is_optional) {
            const val = formData[currentQ.field];
            if (!val || (Array.isArray(val) && val.length === 0)) {
                alert("This field is required.");
                return;
            }
        }
        
        // Auto-save on every step
        await saveProgress();

        if (currentStep < filteredQuestions.length - 1) {
            setDirection(1);
            setCurrentStep(curr => curr + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(curr => curr - 1);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && currentQ.type !== 'intro' && currentQ.type !== 'textarea') {
            e.preventDefault();
            handleNext();
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, profile_photo: file }));
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleMultiSelect = (field, value) => {
        setFormData(prev => {
            const current = prev[field] || [];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    // Fetch Form Definition
    useEffect(() => {
        const fetchForm = async () => {
            try {
                // Determine which form to fetch
                let url = '/forms/get?code=mp-onboarding'; // Default
                if (formId) {
                    url = `/forms/get?id=${formId}`; // Fetch by ID using public endpoint (now supports ID)
                }

                const res = await api.get(url);
                
                // Handle various response structures (flat or wrapped)
                let questionsData = [];
                // Public API returns { questions: [] } or { data: { questions: [] } }
                
                if (res.data.questions) {
                    questionsData = res.data.questions;
                } else if (res.data.data && res.data.data.questions) {
                    questionsData = res.data.data.questions;
                } else if (res.data.fields) {
                     // Fallback if we accidentally hit an admin endpoint structure
                     questionsData = res.data.fields;
                }

                if (questionsData.length > 0) {
                    setQuestions(questionsData);
                } else {
                    setError("Form configuration is active but has no questions.");
                }
            } catch (error) {
                console.error("Failed to load onboarding form", error);
                setError(error.response?.data?.message || error.message || "Failed to connect to server.");
            } finally {
                setFetchingForm(false);
            }
        };
        fetchForm();
    }, [formId]);





    const variants = {
        enter: (direction) => ({
            y: direction > 0 ? 30 : -30,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            y: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            y: direction > 0 ? -30 : 30,
            opacity: 0,
            scale: 0.95
        })
    };

    if (fetchingForm) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900 text-zinc-500">
                <div className="animate-pulse">Loading onboarding...</div>
            </div>
        );
    }

    if (error) {
         return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-900 px-6 text-center">
                <div className="p-4 rounded-full bg-red-100 text-red-600 mb-4">
                    <CloudArrowUpIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Unable to load form</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md">
                    We couldn't retrieve the questions from the server. <br/>
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded mt-2 inline-block">{error}</span>
                </p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!currentQ && !fetchingForm) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900 text-zinc-500">
                <div>Configuration Error: No active questions found for 'mp-onboarding'.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white transition-colors duration-500 flex flex-col font-sans overflow-hidden">
            
            {/* Header: Progress & User Info */}
            <div className="fixed top-0 left-0 w-full z-50">
                 <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800">
                    <motion.div 
                        className="h-full bg-indigo-600 dark:bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep) / (filteredQuestions.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    />
                </div>
                <div className="flex justify-between items-center px-6 py-4">
                    <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                        {isDark ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-zinc-400" />}
                    </button>
                    <div className="flex items-center gap-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 font-display tracking-wide uppercase">
                        <span>{user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Member')}</span>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <button 
                            onClick={() => window.location.href = '/dashboard'} 
                            className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer normal-case font-sans tracking-normal bg-transparent border-none p-0"
                        >
                             Dashboard
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Main Content Area - Centered Full Screen */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 relative">
                <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                        key={currentQ.id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Custom easing for premium feel
                        className="w-full max-w-3xl"
                    >
                        {/* Question Title */}
                        <h2 className={`font-display font-bold leading-tight tracking-tight mb-6 ${currentQ.type === 'intro' ? 'text-4xl sm:text-6xl text-center' : 'text-3xl sm:text-4xl'}`}>
                            {currentQ.title}
                            {currentQ.is_optional == 1 && (
                                <span className="ml-3 text-sm font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded align-middle tracking-wide uppercase">Optional</span>
                            )}
                        </h2>
                        
                        {/* Subtitle / Description */}
                        {(currentQ.subtitle || currentQ.description) && (
                            <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 mb-8 font-light text-center leading-relaxed">
                                {currentQ.subtitle || currentQ.description}
                            </p>
                        )}

                        {/* Input Area */}
                        <div className="mt-6">
                            {/* Text Input */}
                            {currentQ.type === 'text' && (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={formData[currentQ.field]}
                                    onChange={(e) => handleChange(currentQ.field, e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={currentQ.placeholder}
                                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 text-2xl sm:text-3xl py-3 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-medium transition-colors"
                                />
                            )}

                             {/* Date Input */}
                             {currentQ.type === 'date' && (
                                <input
                                    ref={inputRef}
                                    type="date"
                                    value={formData[currentQ.field]}
                                    onChange={(e) => handleChange(currentQ.field, e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 text-2xl sm:text-3xl py-3 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-medium transition-colors"
                                />
                            )}

                            {/* Textarea */}
                            {currentQ.type === 'textarea' && (
                                <textarea
                                    ref={inputRef}
                                    rows={3}
                                    value={formData[currentQ.field]}
                                    onChange={(e) => handleChange(currentQ.field, e.target.value)}
                                    placeholder={currentQ.placeholder}
                                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 text-xl sm:text-2xl py-3 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-medium transition-colors resize-none"
                                />
                            )}

                            {/* Group Inputs */}
                            {currentQ.type === 'group_inputs' && (
                                <div className="space-y-6">
                                    {currentQ.fields.map((f, idx) => (
                                        <div key={f.name}>
                                            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1 uppercase tracking-wider">{f.label}</label>
                                            <input
                                                ref={idx === 0 ? inputRef : null}
                                                type={f.type}
                                                value={formData[f.name]}
                                                onChange={(e) => handleChange(f.name, e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder={f.placeholder || ''}
                                                className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 text-xl py-2 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-medium transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Dropdown Choice */}
                            {currentQ.type === 'dropdown_choice' && (
                                <div className="relative max-w-md">
                                    <select
                                        ref={inputRef}
                                        value={formData[currentQ.field]}
                                        onChange={(e) => handleChange(currentQ.field, e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 text-2xl py-3 outline-none text-zinc-900 dark:text-white font-medium transition-colors cursor-pointer appearance-none"
                                    >
                                        <option value="" className="text-zinc-400">{currentQ.placeholder || "Select an option"}</option>
                                        {currentQ.options.map(opt => (
                                            <option key={opt} value={opt} className="text-zinc-900">{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronRightIcon className="w-5 h-5 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400 pointer-events-none rotate-90" />
                                </div>
                            )}

                            {/* Choice Buttons */}
                            {(currentQ.type === 'choice' || currentQ.type === 'choice_bool') && (
                                <div className="flex flex-col gap-2 max-w-lg">
                                    {(currentQ.options || ['Yes', 'No']).map((opt, i) => {
                                        const isSelected = currentQ.type === 'choice_bool' ? (formData[currentQ.field] === (opt === 'Yes')) : (formData[currentQ.field] === opt);
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    handleChange(currentQ.field, currentQ.type === 'choice_bool' ? (opt === 'Yes') : opt);
                                                    setTimeout(handleNext, 250);
                                                }}
                                                className={`w-full text-left px-5 py-4 rounded-lg border text-lg font-medium transition-all flex items-center justify-between group
                                                    ${isSelected 
                                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                                                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                                    }`}
                                            >
                                                <span className="flex items-center">
                                                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs mr-3 opacity-50">{String.fromCharCode(65 + i)}</span>
                                                    {opt}
                                                </span>
                                                {isSelected && <CheckIcon className="w-5 h-5" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Multiselect Tags */}
                            {currentQ.type === 'multiselect' && (
                                <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {currentQ.options.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => handleMultiSelect(currentQ.field, opt)}
                                            className={`px-4 py-2 rounded-full border text-base font-medium transition-all ${
                                                formData[currentQ.field]?.includes(opt)
                                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm' 
                                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* File Upload */}
                            {currentQ.type === 'file' && (
                                <div className="mt-4">
                                    <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-full hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-800/50 relative overflow-hidden group">
                                        {photoPreview ? (
                                            <>
                                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white font-medium">Change</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-6">
                                                <CloudArrowUpIcon className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                                                <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Upload</span>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    {photoPreview && (
                                         <button onClick={() => { setPhotoPreview(null); setFormData(prev => ({ ...prev, profile_photo: null })); }} className="mt-2 text-red-500 text-xs hover:underline">
                                            Remove
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons Row */}
                        <div className="mt-10 flex items-center justify-between w-full">
                            {/* Back Button (Left) */}
                            <div className="flex-shrink-0">
                                {currentStep > 0 ? (
                                    <button
                                        onClick={handleBack}
                                        className="w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-all"
                                        title="Previous"
                                    >
                                        <ChevronLeftIcon className="w-6 h-6" />
                                    </button>
                                ) : (
                                    <div className="w-12 h-12"></div> // Spacer to keep layout balanced
                                )}
                            </div>

                            {/* Next Button (Right) */}
                            <div className="flex-shrink-0">
                                {currentQ.type === 'intro' ? (
                                    <button
                                        onClick={handleNext}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg transition-all flex items-center gap-2 transform hover:scale-105"
                                    >
                                        {currentQ.buttonText} <ArrowRightIcon className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-lg font-bold shadow-md transition-all flex items-center gap-2"
                                    >
                                        {currentStep === filteredQuestions.length - 1 ? (loading ? 'Saving...' : 'Complete') : 'Next'}
                                        {!loading && currentStep !== filteredQuestions.length - 1 && <ChevronRightIcon className="w-5 h-5" />}
                                    </button>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>
            {/* Footer Background */}
            <div className="fixed bottom-0 left-0 w-full z-0 pointer-events-none flex justify-center">
                <GoaLandscape className="w-full max-w-4xl h-auto opacity-30 dark:opacity-15 text-slate-600 dark:text-slate-400" />
            </div>
        </div>
    );
};

export default Onboarding;
