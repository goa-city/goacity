import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSingleMeeting, checkInMeeting, rsvpMeeting } from '../api/meetings.api';

export interface MeetingResource {
    id: number;
    title: string;
    url: string;
}

export interface Meeting {
    id: number;
    title: string;
    meeting_date: string;
    location_name: string;
    zoom_link?: string;
    recap_content?: string;
    resources?: MeetingResource[];
    feedback_form_id?: number;
    checked_in?: number;
    start_time_display?: string;
    end_time_display?: string;
    map_link?: string;
    my_rsvp?: 'going' | 'not_sure' | 'cant_go' | null;
}

export const useSingleMeeting = (id: string | undefined) => {
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['meeting', id],
        queryFn: () => fetchSingleMeeting(id!),
        enabled: !!id
    });

    const checkInMutation = useMutation({
        mutationFn: () => checkInMeeting(Number(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meeting', id] });
            queryClient.invalidateQueries({ queryKey: ['meetings-upcoming'] });
            queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
        }
    });

    const rsvpMutation = useMutation({
        mutationFn: (status: string) => rsvpMeeting(Number(id), status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meeting', id] });
            queryClient.invalidateQueries({ queryKey: ['meetings-upcoming'] });
            queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
        }
    });

    return {
        meeting: query.data as Meeting | undefined,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        checkIn: () => checkInMutation.mutateAsync(),
        isCheckingIn: checkInMutation.isPending,
        rsvp: (status: string) => rsvpMutation.mutateAsync(status),
        isRsvping: rsvpMutation.isPending
    };
};
