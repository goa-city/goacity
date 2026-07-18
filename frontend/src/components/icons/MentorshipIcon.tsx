import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export const MentorshipIcon: React.FC<IconProps> = ({ className, ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            {/* Left Head */}
            <circle cx="7.5" cy="6.5" r="2.5" />
            {/* Right Head */}
            <circle cx="16.5" cy="8.5" r="2" />
            {/* Left Person's Body */}
            <path d="M 2.5 18 L 2.5 14 C 2.5 11 11.5 11 11.5 14 L 11.5 18" />
            {/* Left Person's Bottom Connection Line */}
            <path d="M 2.5 18 L 18 18" />
            {/* Right Person's Body */}
            <path d="M 13 21 L 13 16.5 C 13 13.5 21.5 13.5 21.5 21" />
            {/* Right Person's Bottom Connection Line */}
            <path d="M 13 21 L 21.5 21" />
        </svg>
    );
};
