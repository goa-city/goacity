import prisma from '../lib/prisma.js';

export class AssessmentService {
    static async processMenteeAssessment(userId: number, responseId: number) {
        // 1. Fetch answers for this assessment
        const answers = await prisma.formAnswer.findMany({
            where: { response_id: responseId }
        });

        // 2. Fetch the response to find form_id
        const formResponse = await prisma.formResponse.findUnique({
            where: { id: responseId }
        });
        const formId = formResponse?.form_id;

        // Fetch form fields to get labels/metadata
        const formFields = formId 
            ? await prisma.formField.findMany({ where: { form_id: formId } }) 
            : [];

        // Find keys where label or field_key is relevant to mentorship focus, growth, or stage
        const targetKeys = formFields
            .filter(f => 
                f.field_key.includes('category') || 
                f.field_key.includes('expertise') || 
                f.field_key.includes('pillar') ||
                f.field_key.includes('growth') ||
                f.field_key.includes('struggle') ||
                f.label?.toLowerCase().includes('guidance') || 
                f.label?.toLowerCase().includes('struggling') || 
                f.label?.toLowerCase().includes('stage') || 
                f.label?.toLowerCase().includes('focus') || 
                f.label?.toLowerCase().includes('pillar') || 
                f.label?.toLowerCase().includes('growth')
            )
            .map(f => f.field_key);

        // Extract values from answers matching targetKeys or fallback to key check
        const searchTags: string[] = [];
        answers.forEach(a => {
            const matchesKey = targetKeys.includes(a.field_key) ||
                a.field_key.includes('category') || 
                a.field_key.includes('expertise') || 
                a.field_key.includes('pillar');
                
            if (matchesKey && a.answer_value) {
                try {
                    const parsed = JSON.parse(a.answer_value);
                    if (Array.isArray(parsed)) {
                        searchTags.push(...parsed.map(p => String(p).toLowerCase().trim()));
                    } else {
                        searchTags.push(String(parsed).toLowerCase().trim());
                    }
                } catch (e) {
                    searchTags.push(a.answer_value.toLowerCase().trim());
                }
            }
        });

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
                        linkedin_url: true,
                        businesses: {
                            select: {
                                business_name: true
                            }
                        },
                        profiles: {
                            select: {
                                profile_key: true,
                                profile_value: true
                            }
                        }
                    } 
                } 
            }
        });

        // 4. Calculate Match Score
        const recommendations = mentors.map(mentor => {
            const mentorExpertise = Array.isArray(mentor.expertise) 
                ? (mentor.expertise as string[]).map(e => e.toLowerCase())
                : [];
            
            const overlap = mentorExpertise.filter(tag => 
                searchTags.some(st => st?.includes(tag) || tag.includes(st || ''))
            );
            
            let matchWhy = "";
            if (overlap.length > 0) {
                matchWhy = `Both of you focus on ${overlap.slice(0, 2).join(' and ')}.`;
            }

            // Resolve company/organization name
            const companyName = mentor.member.businesses?.[0]?.business_name ||
                mentor.member.profiles?.find(p => 
                    ['company', 'company_name', 'organization', 'organization_name', 'company name', 'organization name'].includes(p.profile_key.toLowerCase())
                )?.profile_value ||
                null;

            return {
                mentor_id: mentor.member_id,
                first_name: mentor.member.first_name,
                last_name: mentor.member.last_name,
                profile_photo: mentor.member.profile_photo,
                bio: mentor.bio || mentor.member.bio,
                match_score: overlap.length,
                match_why: matchWhy,
                formats: mentor.formats,
                expertise: mentor.expertise,
                company: companyName
            };
        });

        // 5. Sort by score and return top 5
        return recommendations
            .sort((a, b) => b.match_score - a.match_score)
            .slice(0, 5);
    }
}
