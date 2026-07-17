import React from 'react';
import { Card, CardContent, CardFooter } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';

interface MentorCardProps {
    mentor: {
        id: number;
        first_name: string;
        last_name: string;
        profile_photo?: string;
        business_name?: string;
        bio?: string;
    };
    onRequest: (mentor: MentorCardProps['mentor']) => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, onRequest }) => {
    return (
        <Card className="flex flex-col items-center text-center p-6 h-full hover:shadow-xl transition-all duration-300 group">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/30 rounded-full mb-6 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-3xl font-black border-4 border-white dark:border-zinc-800 shadow-sm overflow-hidden shrink-0">
                {mentor.profile_photo ? (
                    <img src={mentor.profile_photo} alt="" className="w-full h-full object-cover" />
                ) : (
                    <span>{mentor.first_name?.[0]}{mentor.last_name?.[0]}</span>
                )}
            </div>
            
            <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">
                {mentor.first_name} {mentor.last_name}
            </h3>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">
                {mentor.business_name || 'Business Leader'}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md uppercase tracking-wider border border-indigo-100 dark:border-indigo-800">
                    Willing to Mentor
                </span>
            </div>

            <CardContent className="mt-6 w-full px-0 flex-1">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed italic">
                    "{mentor.bio || `Passionate about helping others grow in their kingdom journey through ${mentor.business_name || 'leadership'}.`}"
                </p>
            </CardContent>

            <CardFooter className="w-full px-0 pb-0 pt-6">
                <Button 
                    onClick={() => onRequest(mentor)}
                    className="w-full rounded-xl"
                >
                    Connect
                </Button>
            </CardFooter>
        </Card>
    );
};

export default MentorCard;
