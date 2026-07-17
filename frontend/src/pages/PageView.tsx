import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';

interface PageData {
    title: string;
    content: string;
}

const PageView: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await api.get(`/pages/${slug}`);
                setPage(res.data);
            } catch (error) {
                console.error("Failed to fetch page", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="py-40 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Content...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!page) {
        return (
            <DashboardLayout>
                <div className="text-center py-40">
                    <div className="text-zinc-300 dark:text-zinc-700 font-black text-6xl uppercase italic tracking-tighter mb-4 opacity-20">404</div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-2">Knowledge Gap</h2>
                    <p className="text-zinc-500 font-medium italic">The content mapping requested could not be resolved.</p>
                </div>
            </DashboardLayout>
        );
    }
    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-12 px-6">
                <header className="mb-12">
                    <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
                        {page.title}
                    </h1>
                    <div className="h-1 w-20 bg-indigo-600 mt-6"></div>
                </header>

                <article
                    className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:rounded-3xl prose-img:shadow-2xl"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />

                <footer className="mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        End of Documentation
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                    </div>
                </footer>
            </div>
        </DashboardLayout>
    );
};

export default PageView;
