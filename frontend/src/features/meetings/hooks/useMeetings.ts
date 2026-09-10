import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUpcomingMeetings, fetchPastMeetings, rsvpMeeting, checkInMeeting } from '../api/meetings.api';
import type { Meeting } from './useSingleMeeting';

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
        mutationFn: ({ meetingId, status }: { meetingId: number; status: string }) => rsvpMeeting(meetingId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetings-upcoming'] });
            queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
        }
    });

    const checkInMutation = useMutation({
        mutationFn: (meetingId: number) => checkInMeeting(meetingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetings-upcoming'] });
            queryClient.invalidateQueries({ queryKey: ['meetings-past'] });
            queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
        }
    });

    const rsvp = async (meetingId: number, status: string) => {
        return rsvpMutation.mutateAsync({ meetingId, status });
    };

    return {
        upcoming: (upcomingQuery.data as Meeting[]) || [],
        past: (pastQuery.data as Meeting[]) || [],
        isLoading: upcomingQuery.isLoading || pastQuery.isLoading,
        error: upcomingQuery.error || pastQuery.error,
        refetch: async () => {
            await Promise.all([upcomingQuery.refetch(), pastQuery.refetch()]);
        },
        rsvp,
        checkIn: (meetingId: number) => checkInMutation.mutateAsync(meetingId),
        isRsvping: rsvpMutation.isPending,
        isCheckingIn: checkInMutation.isPending
    };
};
