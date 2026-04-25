import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';
import { ChatBubbleLeftIcon, UsersIcon } from '@heroicons/react/24/outline';

const IdeaCard = ({ idea }) => {
    const statusColors = {
        Draft: 'bg-zinc-100 text-zinc-600',
        Submitted: 'bg-indigo-50 text-indigo-700',
        Under_Review: 'bg-amber-50 text-amber-700',
        Validated: 'bg-emerald-50 text-emerald-700',
        Launched: 'bg-indigo-600 text-white'
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${statusColors[idea.status] || 'bg-zinc-100 text-zinc-600'}`}>
                        {idea.status}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                </div>
                <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {idea.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-200 overflow-hidden shrink-0">
                        {idea.founder?.profile_photo ? (
                            <img src={idea.founder.profile_photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                {idea.founder?.first_name?.[0]}
                            </div>
                        )}
                    </div>
                    <span className="text-xs font-bold text-zinc-500 tracking-wide">
                        by {idea.founder?.first_name} {idea.founder?.last_name}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-zinc-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {idea.problem_statement}
                </p>
                
                <div className="flex items-center gap-4 pt-4 border-t border-zinc-50 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">{idea.feedbacks?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                        <UsersIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">{Object.keys(idea.needs_json || {}).length} needs</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default IdeaCard;
