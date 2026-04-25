import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUpcomingMeetings, fetchPastMeetings, rsvpMeeting } from '../api/meetings.api';

export const useMeetings = () => {
    const queryClient = useQueryClient();

    const upcomingQuery = useQuery({
        queryKey: ['meetings-upcoming'],
        queryFn: fetchUpcomingMeetings
    });

    const pastQuery = useQuery({
        queryKey: ['meetings-past'],
        queryFn: fetchPastMeetings
    });

    const rsvpMutation = useMutation({
        mutationFn: ({ meetingId, status }) => rsvpMeeting(meetingId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetings-upcoming'] });
        }
    });

    return {
        upcoming: upcomingQuery.data || [],
        past: pastQuery.data || [],
        isLoading: upcomingQuery.isLoading || pastQuery.isLoading,
        error: upcomingQuery.error || pastQuery.error,
        refetch: async () => {
            await Promise.all([upcomingQuery.refetch(), pastQuery.refetch()]);
        },
        rsvp: rsvpMutation.mutateAsync,
        isRsvping: rsvpMutation.isPending
    };
};
