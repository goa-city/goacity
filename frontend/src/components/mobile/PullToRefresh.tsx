import React, { useState, useRef } from 'react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const startY = useRef(0);
    const maxPull = 100;
    const threshold = 60;
    
    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPulling || isRefreshing) return;
        
        const y = e.touches[0].clientY;
        const delta = y - startY.current;
        
        if (delta > 0 && window.scrollY === 0) {
            // Prevent default can't be called on passive listeners in some browsers
            // but for pull-to-refresh it's usually okay in this context
            setPullDistance(Math.min(delta * 0.5, maxPull));
        }
    };
    
    const handleTouchEnd = async () => {
        if (!isPulling) return;
        
        setIsPulling(false);
        
        if (pullDistance >= threshold) {
            setIsRefreshing(true);
            setPullDistance(threshold); // Hold at threshold while refreshing
            
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0);
        }
    };

    return (
        <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative min-h-screen"
        >
            <div 
                className="absolute left-0 right-0 flex justify-center items-center overflow-hidden transition-all duration-300 pointer-events-none z-50"
                style={{ 
                    height: `${pullDistance}px`,
                    top: `-${pullDistance}px`,
                    transform: `translateY(${pullDistance}px)`
                }}
            >
                <div className="bg-white dark:bg-zinc-900 rounded-full shadow-xl p-2 border border-zinc-100 dark:border-zinc-800">
                    {isRefreshing ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
                    ) : (
                        <div 
                            className="flex items-center justify-center transition-opacity"
                            style={{ opacity: pullDistance / threshold }}
                        >
                            <svg 
                                className={`w-5 h-5 text-indigo-600 transition-transform duration-300 ${pullDistance >= threshold ? 'rotate-180' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
            
            <div 
                className="transition-transform duration-300 h-full"
                style={{ transform: `translateY(${pullDistance}px)` }}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
