import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const DebugStreams: React.FC = () => {
    const [status, setStatus] = useState('Initializing...');
    const [response, setResponse] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const runSetup = async () => {
            try {
                setStatus('Running setup_test_data.php...');
                const res = await api.get('/setup-test-data');
                setResponse(res.data);
                setStatus('Success! Data populated.');
            } catch (error: any) {
                console.error("Setup failed", error);
                setStatus('Failed: ' + (error.response?.data?.message || error.message));
                setResponse(error.response?.data);
            }
        };

        runSetup();
    }, []);

    return (
        <div className="p-10 font-sans bg-zinc-950 min-h-screen text-white">
            <h1 className="text-3xl font-black mb-6 uppercase tracking-widest italic text-indigo-400">Diagnostic Suite</h1>
            <div className="mb-8 p-6 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${status.includes('Success') ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">System Status</span>
                </div>
                <strong className="text-xl font-bold tracking-tight">{status}</strong>
            </div>
            {response && (
                <div className="mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 ml-2">Kernel Response Output</p>
                    <pre className="bg-zinc-900 p-8 rounded-[2rem] overflow-auto border border-zinc-800 text-emerald-500/80 font-mono text-sm shadow-inner">
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}
            <div className="flex gap-4">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-10 py-5 bg-white text-zinc-950 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    Return to Hub
                </button>
                <button 
                     onClick={() => window.location.reload()}
                     className="px-10 py-5 bg-zinc-800 text-zinc-400 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all shadow-xl"
                >
                    Recalibrate
                </button>
            </div>
        </div>
    );
};

export default DebugStreams;
