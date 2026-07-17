import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';
import { formatDate } from '../utils/date';

// Category → curated Unsplash image pool (deterministic by index within category)
const CATEGORY_IMAGES: Record<string, string[]> = {
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
const assignImage = (resource: any, idxInCategory: number) => {
    if (!resource.category) return CATEGORY_IMAGES._default[idxInCategory % CATEGORY_IMAGES._default.length];
    const firstCat = resource.category.split(',').map((c: string) => c.trim()).find((c: string) => CATEGORY_IMAGES[c]);
    const pool = CATEGORY_IMAGES[firstCat] || CATEGORY_IMAGES._default;
    return pool[idxInCategory % pool.length];
};

const INITIAL_CATEGORIES = ['All Categories'];

const Resources: React.FC = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All Categories');
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/member/resources')
            .then(res => {
                // Assign images: prioritize image_url from DB, then deterministic Unsplash
                const catCounters: Record<string, number> = {};
                const withImages = res.data.map((r: any) => {
                    const firstCat = r.category ? r.category.split(',')[0].trim() : '_default';
                    if (!catCounters[firstCat]) catCounters[firstCat] = 0;

                    // Priority: 1. image_url from DB, 2. Unsplash deterministic pool
                    const img = r.image_url || assignImage(r, catCounters[firstCat]++);

                    return {
                        ...r,
                        image: img,
                        date: formatDate(r.created_at),
                    };
                });
                setResources(withImages);

                // Extract unique categories from resources (so only categories with articles appear)
                const dbCategories = [...new Set(
                    res.data.flatMap((r: any) =>
                        r.category ? r.category.split(',').map((c: string) => c.trim()) : []
                    )
                )].sort() as string[];
                setCategories(['All Categories', ...dbCategories]);
            })
            .catch(err => console.error('Failed to load resources:', err))
            .finally(() => setLoading(false));
    }, []);

    const isAllCategories = activeCategory === 'All Categories';

    const filteredResources = isAllCategories
        ? resources
        : resources.filter(r => {
            if (!r.category) return false;
            const cats = r.category.split(',').map((c: string) => c.trim());
            return cats.includes(activeCategory);
        });

    // Standard = all filtered resources (we use the standard look and feel as the default)
    const standardItems = filteredResources;

    // ResourceCard
    const ResourceCard = ({ item }: { item: any }) => (
        <div
            className="group cursor-pointer hover:-translate-y-1 transition-all duration-300"
            onClick={() => item.url && window.open(item.url, '_blank')}
        >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-zinc-100 dark:bg-zinc-900 shadow-2xl shadow-zinc-200/50 dark:shadow-none border-none">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e: any) => { e.target.onerror = null; e.target.src = CATEGORY_IMAGES._default[0]; }}
                />
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
                {item.category && item.category.split(',').map((cat: string) => (
                    <span key={cat} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-100 dark:border-zinc-800 px-3 py-1 rounded-lg">
                        {cat.trim()}
                    </span>
                ))}
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-100 dark:border-zinc-800 px-3 py-1 rounded-lg">
                    {item.date}
                </span>
                {item.url && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1 rounded-lg">
                        External Link
                    </span>
                )}
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors mb-2 ">
                {item.title}
            </h3>
            {item.author && (
                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">
                    By {item.author}
                </p>
            )}
            {item.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed font-medium">
                    {item.description}
                </p>
            )}
        </div>
    );

    return (
        <DashboardLayout>
            <div className="mb-12">
                {/* Header */}
                <div className="flex flex-wrap gap-6 justify-between items-start mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">Resources</h1>
                        <p className="text-zinc-400 font-black mt-2 uppercase tracking-[0.1em] text-[10px]">Discover and share curated content for the kingdom.</p>
                    </div>
                    <button
                        onClick={() => navigate('/resources/add')}
                        className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
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
                            className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeCategory === cat
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                                : 'bg-white dark:bg-zinc-900/30 text-zinc-500 border-none shadow-sm hover:shadow-md transition-all'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[4/3] rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-6" />
                                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-1/3 mb-4" />
                                <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full w-3/4" />
                            </div>
                        ))}
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-40">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">No resources found. Be the first to lead the way!</p>
                    </div>
                ) : (
                    <>
                        {/* Standard Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
                            {standardItems.length > 0 ? (
                                standardItems.map(item => (
                                    <ResourceCard key={item.id} item={item} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-32">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No resources found in "{activeCategory}"</p>
                                </div>
                            )}
                        </div>

                        <div className="py-24 text-center">
                            <button className="px-10 py-3.5 border border-zinc-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
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
