import prisma from '../lib/prisma.js';

export class AssessmentService {
    static async processMenteeAssessment(userId: number, responseId: number) {
        // 1. Fetch answers for this assessment
        const answers = await prisma.formAnswer.findMany({
            where: { response_id: responseId }
        });

        // 2. Extract "Search Tags" from answers
        // We look for field keys like 'category', 'expertise', 'pillars'
        const searchTags = answers
            .filter(a => a.field_key.includes('category') || a.field_key.includes('expertise') || a.field_key.includes('pillar'))
            .map(a => a.answer_value?.toLowerCase().trim())
            .filter(Boolean);

        console.log(`[Matching] Processing assessment for User ${userId}. Tags found:`, searchTags);

        // 3. Find approved mentors
        const mentors = await prisma.mentorProfile.findMany({
            where: { is_approved: true },
            include: { 
                member: { 
                    select: { 
                        id: true, 
                        first_name: true, 
                        last_name: true, 
                        profile_photo: true,
                        bio: true,
                        linkedin_url: true
                    } 
                } 
            }
        });

        // 4. Calculate Match Score
        const recommendations = mentors.map(mentor => {
            const mentorExpertise = Array.isArray(mentor.expertise) 
                ? (mentor.expertise as string[]).map(e => e.toLowerCase())
                : [];
            
            const overlap = mentorExpertise.filter(tag => searchTags.some(st => st?.includes(tag) || tag.includes(st || '')));
            
            let matchWhy = "Matches your current stage and kingdom growth goals.";
            if (overlap.length > 0) {
                matchWhy = `Both of you focus on ${overlap.slice(0, 2).join(' and ')}.`;
            }

            return {
                mentor_id: mentor.member_id,
                first_name: mentor.member.first_name,
                last_name: mentor.member.last_name,
                profile_photo: mentor.member.profile_photo,
                bio: mentor.bio || mentor.member.bio,
                match_score: overlap.length,
                match_why: matchWhy,
                formats: mentor.formats,
                expertise: mentor.expertise
            };
        });

        // 5. Sort by score and return top 5
        return recommendations
            .sort((a, b) => b.match_score - a.match_score)
            .slice(0, 5);
    }
}
