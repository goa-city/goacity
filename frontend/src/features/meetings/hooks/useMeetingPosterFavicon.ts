import { useEffect } from 'react';

interface MeetingMetaSource {
    title?: string | null;
    poster_image_url?: string | null;
}

const DEFAULT_ICON = '/goa-city-icon.png';
const DEFAULT_TITLE = 'Goa.City';

/**
 * Hook to dynamically update the document title and browser favicon (<link rel="icon">
 * and <link rel="apple-touch-icon">) to the meeting poster image when viewing a meeting
 * or payment page, reverting to the default Goa.City icon when navigating away.
 */
export const useMeetingPosterFavicon = (meeting?: MeetingMetaSource | null) => {
    useEffect(() => {
        if (!meeting) return;

        const posterUrl = meeting.poster_image_url;
        const title = meeting.title;

        // Update document title
        if (title) {
            document.title = `${title} | Goa.City`;
        }

        // Update favicon if poster image exists
        if (posterUrl) {
            let iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
            let appleIconLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");

            if (!iconLink) {
                iconLink = document.createElement('link');
                iconLink.rel = 'icon';
                document.head.appendChild(iconLink);
            }
            iconLink.href = posterUrl;

            if (!appleIconLink) {
                appleIconLink = document.createElement('link');
                appleIconLink.rel = 'apple-touch-icon';
                document.head.appendChild(appleIconLink);
            }
            appleIconLink.href = posterUrl;
        }

        return () => {
            // Revert back to default Goa.City icon and title on cleanup
            const iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
            if (iconLink) {
                iconLink.href = DEFAULT_ICON;
            }
            const appleIconLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
            if (appleIconLink) {
                appleIconLink.href = DEFAULT_ICON;
            }
            document.title = DEFAULT_TITLE;
        };
    }, [meeting?.poster_image_url, meeting?.title]);
};
