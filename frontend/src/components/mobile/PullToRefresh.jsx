import React, { useState, useEffect, useRef } from 'react';

const PullToRefresh = ({ onRefresh, children }) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const startY = useRef(0);
    const maxPull = 100;
    const threshold = 60;
    
    const handleTouchStart = (e) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    };
    
    const handleTouchMove = (e) => {
        if (!isPulling || isRefreshing) return;
        
        const y = e.touches[0].clientY;
        const delta = y - startY.current;
        
        if (delta > 0 && window.scrollY === 0) {
            e.preventDefault();
            // Add a little friction
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
                className="absolute left-0 right-0 flex justify-center items-center overflow-hidden transition-all duration-300 pointer-events-none"
                style={{ 
                    height: `${pullDistance}px`,
                    top: `-${pullDistance}px`,
                    transform: `translateY(${pullDistance}px)`
                }}
            >
                {isRefreshing ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                ) : (
                    <div 
                        className="text-gray-400 font-medium text-sm transition-opacity"
                        style={{ opacity: pullDistance / maxPull }}
                    >
                        {pullDistance >= threshold ? 'Release to refresh' : 'Pull down to refresh'}
                    </div>
                )}
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
