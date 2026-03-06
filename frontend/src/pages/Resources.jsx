import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';

// Category → curated Unsplash image pool (deterministic by index within category)
const CATEGORY_IMAGES = {
    Community: [
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=2070&auto=format&fit=crop',
    ],
    Awards: [
        'https://images.unsplash.com/photo-1628191010210-a59de33e5941?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1561089489-f13d5e730d72?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=2072&auto=format&fit=crop',
    ],
    Event: [
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop',
    ],
    Design: [
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1974&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2076&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
    ],
    Interviews: [
        'https://images.unsplash.com/photo-1542038784456-1ea8c935640e?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?q=80&w=2069&auto=format&fit=crop',
    ],
    _default: [
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542038784456-1ea8c935640e?q=80&w=2070&auto=format&fit=crop',
    ],
};

// Assign a deterministic image to each resource based on its index in its category
const assignImage = (resource, idxInCategory) => {
    const pool = CATEGORY_IMAGES[resource.category] || CATEGORY_IMAGES._default;
    return pool[idxInCategory % pool.length];
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const INITIAL_CATEGORIES = ['All Categories'];

const Resources = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All Categories');
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/resources')
            .then(res => {
                // Assign images: prioritize image_url from DB, then deterministic Unsplash
                const catCounters = {};
                const withImages = res.data.map(r => {
                    const cat = r.category || '_default';
                    if (!catCounters[cat]) catCounters[cat] = 0;
                    
                    // Priority: 1. image_url from DB, 2. Unsplash deterministic pool
                    const img = r.image_url || assignImage(r, catCounters[cat]++);
                    
                    return {
                        ...r,
                        image: img,
                        date: formatDate(r.created_at),
                    };
                });
                setResources(withImages);

                // Extract unique categories from DB
                const dbCategories = [...new Set(res.data.map(r => r.category).filter(Boolean))].sort();
                setCategories(['All Categories', ...dbCategories]);
            })
            .catch(err => console.error('Failed to load resources:', err))
            .finally(() => setLoading(false));
    }, []);

    const isAllCategories = activeCategory === 'All Categories';

    const filteredResources = isAllCategories
        ? resources
        : resources.filter(r => r.category === activeCategory);

    // Featured = first 3 (used only in "All Categories" hero)
    const featured = resources.slice(0, 3);
    // Standard = everything after featured (or all when filtering)
    const standardItems = isAllCategories ? resources.slice(3) : filteredResources;

    // ResourceCard — identical to original
    const ResourceCard = ({ item }) => (
        <div
            className="group cursor-pointer"
            onClick={() => item.url && window.open(item.url, '_blank')}
        >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-gray-100">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={e => { e.target.onerror = null; e.target.src = CATEGORY_IMAGES._default[0]; }}
                />
            </div>
            <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border border-gray-300 px-3 py-1 rounded-full">
                    {item.category}
                </span>
                <span className="text-[10px] text-gray-400 border border-gray-300 px-3 py-1 rounded-full">
                    {item.date}
                </span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 leading-snug group-hover:text-[#E0A876] transition-colors mb-1">
                {item.title}
            </h3>
            {item.author && (
                <p className="text-sm font-medium text-indigo-600 mb-2">
                    By {item.author}
                </p>
            )}
            {item.description && (
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                    {item.description}
                </p>
            )}
        </div>
    );

    return (
        <DashboardLayout>
            <div className="mb-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#2D2D46]">Resources</h1>
                        <p className="text-gray-500 mt-2">Discover and share curated content.</p>
                    </div>
                    <button
                        onClick={() => navigate('/resources/add')}
                        className="bg-sky-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-sky-700 transition-colors"
                    >
                        + Add a resource
                    </button>
                </div>

                {/* Categories */}
                <div className="flex overflow-x-auto gap-3 pb-8 mb-4 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-6 py-2 rounded-xl text-sm font-bold border transition-all ${
                                activeCategory === cat
                                    ? 'bg-[#2D2D46] text-white border-[#2D2D46]'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-500'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    /* Loading skeleton — same grid layout */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[4/3] rounded-2xl bg-gray-200 mb-5" />
                                <div className="h-4 bg-gray-200 rounded-full w-1/3 mb-3" />
                                <div className="h-5 bg-gray-200 rounded-full w-3/4" />
                            </div>
                        ))}
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-32 text-gray-400">
                        <p className="text-xl mb-2">No resources yet</p>
                        <p className="text-sm">Be the first to add a resource!</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Hero Grid — only on "All Categories" with enough items */}
                        {isAllCategories && featured.length >= 1 && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
                                {/* Main featured */}
                                <div
                                    className="lg:col-span-1 aspect-[4/5] lg:aspect-auto lg:h-full relative group rounded-2xl overflow-hidden cursor-pointer"
                                    onClick={() => featured[0].url && window.open(featured[0].url, '_blank')}
                                >
                                    <img
                                        src={featured[0].image}
                                        alt={featured[0].title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={e => { e.target.onerror = null; e.target.src = CATEGORY_IMAGES._default[0]; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-white border border-white/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                                {featured[0].category}
                                            </span>
                                            <span className="text-[10px] text-white/80 border border-white/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                                {featured[0].date}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-medium text-white leading-snug mb-1">
                                            {featured[0].title}
                                        </h2>
                                        {featured[0].author && (
                                            <p className="text-sm text-indigo-300 font-medium">
                                                By {featured[0].author}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right side featured (2 & 3) */}
                                {featured.length > 1 && (
                                    <div className="lg:col-span-2 flex flex-col gap-6">
                                        {featured.slice(1).map((item) => (
                                            <div
                                                key={item.id}
                                                className="aspect-[16/7] relative group rounded-2xl overflow-hidden cursor-pointer"
                                                onClick={() => item.url && window.open(item.url, '_blank')}
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    onError={e => { e.target.onerror = null; e.target.src = CATEGORY_IMAGES._default[0]; }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white border border-white/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                                            {item.category}
                                                        </span>
                                                        <span className="text-[10px] text-white/80 border border-white/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                                            {item.date}
                                                        </span>
                                                    </div>
                                                    <h2 className="text-xl font-medium text-white leading-snug max-w-lg mb-1">
                                                        {item.title}
                                                    </h2>
                                                    {item.author && (
                                                        <p className="text-sm text-indigo-300 font-medium">
                                                            By {item.author}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Standard Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                            {standardItems.length > 0 ? (
                                standardItems.map(item => (
                                    <ResourceCard key={item.id} item={item} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-gray-400">
                                    <p className="text-lg">No resources found in "{activeCategory}"</p>
                                </div>
                            )}
                        </div>

                        <div className="py-20 text-center">
                            <button className="px-6 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                                Load More
                            </button>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Resources;
