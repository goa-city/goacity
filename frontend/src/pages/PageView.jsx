import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';

const PageView = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
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

    if (loading) return <DashboardLayout><div className="p-12 text-center text-gray-400">Loading...</div></DashboardLayout>;
    
    if (!page) return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto text-center py-20">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Page not found</h1>
                <p className="text-gray-500">The page you are looking for does not exist or has been moved.</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">{page.title}</h1>
                <div 
                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            </div>
        </DashboardLayout>
    );
};

export default PageView;
