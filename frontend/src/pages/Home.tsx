import React from 'react';
import { Link } from 'react-router-dom';
import GoaLandscape from '../components/GoaLandscape';

const Home: React.FC = () => {
    return (
        <div className="relative isolate overflow-hidden bg-zinc-950 min-h-screen flex items-center justify-center font-sans">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/10 to-transparent"></div>
                <GoaLandscape className="absolute bottom-0 w-full text-zinc-900 opacity-20 pointer-events-none" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
                <div className="mx-auto max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        United in Purpose
                    </div>
                    
                    <h1 className="text-5xl font-black tracking-widest text-white sm:text-7xl uppercase italic leading-tight">
                        GOA CITY<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">MOVEMENT</span>
                    </h1>
                    
                    <p className="mt-8 text-lg leading-relaxed text-zinc-400 font-medium max-w-xl mx-auto tracking-wide">
                        A collaborative initiative connecting the kingdom through technology, resources, and shared vision.
                    </p>
                    
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            to="/login"
                            className="group relative px-8 py-4 bg-white text-zinc-950 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                        >
                            Member Portal
                        </Link>
                        <Link
                            to="/news"
                            className="text-zinc-400 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
                        >
                            Explore Updates
                        </Link>
                     </div>
                </div>
            </div>

            {/* Footer decoration */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">
                EST. 2024
            </div>
        </div>
    );
};

export default Home;
