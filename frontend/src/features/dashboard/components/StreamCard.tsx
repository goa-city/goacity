import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';

interface DashboardStream {
    id: number;
    name: string;
    color: string;
    member_count?: number;
    has_form?: boolean;
    form_completed?: boolean;
    form_details?: {
        id?: number;
    } | null;
}

interface StreamCardProps {
    stream: DashboardStream;
}

const StreamCard: React.FC<StreamCardProps> = ({ stream }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (stream.has_form && !stream.form_completed && stream.form_details?.id) {
            navigate(`/onboarding/form/${stream.form_details.id}`);
        } else {
            navigate(`/my-people?stream=${stream.id}`);
        }
    };

    return (
        <Card 
            onClick={handleClick}
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden border-none shadow-md h-36"
            style={{ backgroundColor: stream.color }}
        >
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition-opacity" />
            
            <div className="p-5 h-full flex flex-col justify-between relative z-10">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight">{stream.name}</h3>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">
                        {stream.member_count || 0} Members
                    </p>
                </div>

                <div className="flex justify-between items-end">
                    {stream.has_form && !stream.form_completed ? (
                        <Button 
                            size="sm" 
                            variant="secondary"
                            className="rounded-xl text-[10px] py-1 px-3 bg-white text-zinc-900 border-none shadow-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/onboarding/form/${stream.form_details?.id}`);
                            }}
                        >
                            Complete Onboarding
                        </Button>
                    ) : (
                        <div className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-xl uppercase tracking-widest">
                            Active Stream
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default StreamCard;
