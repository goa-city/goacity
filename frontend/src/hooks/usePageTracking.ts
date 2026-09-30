import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    let sessionId = sessionStorage.getItem('gc_analytics_session');
    if (!sessionId) {
        sessionId = 's_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
        sessionStorage.setItem('gc_analytics_session', sessionId);
    }
    return sessionId;
}

function getDeviceType(): string {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
}

export function usePageTracking(): void {
    const location = useLocation();
    const lastPathRef = useRef<string>('');

    useEffect(() => {
        const fullPath = location.pathname + location.search;

        // Skip duplicate tracks on exact same path if fired in quick succession
        if (fullPath === lastPathRef.current) return;
        lastPathRef.current = fullPath;

        // Infer entity type if present
        let entityType: string | undefined = undefined;
        let entityId: number | undefined = undefined;

        if (location.pathname.startsWith('/meetings/')) {
            entityType = 'meeting';
        } else if (location.pathname.startsWith('/jobs/')) {
            entityType = 'job';
        } else if (location.pathname.startsWith('/profile/')) {
            entityType = 'profile';
        } else if (location.pathname.startsWith('/resources')) {
            entityType = 'resource';
        } else if (location.pathname.startsWith('/incubator/')) {
            entityType = 'incubator';
        }

        const payload = {
            path: fullPath,
            sessionId: getOrCreateSessionId(),
            referrer: typeof document !== 'undefined' ? document.referrer : undefined,
            deviceType: getDeviceType(),
            entityType,
            entityId
        };

        // Fire-and-forget background track
        api.post('/analytics/track', payload).catch(() => {
            // Silently swallow analytics ingestion failures so UX is unaffected
        });
    }, [location.pathname, location.search]);
}
