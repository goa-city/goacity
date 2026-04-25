import { PrismaClient } from '@prisma/client';
import { requestContext } from './context.js';

const prismaClient = new PrismaClient();

// Models that are GLOBAL and do NOT have a city_id column.
// These should never be filtered by city scope.
const UNSCOPED_MODELS = new Set([
    'City',
    'Admin',
    'Otp',
    'StreamMember',
    'FormField',
    'FormResponse',
    'FormAnswer',
    'MeetingResponse',
    'MeetingResource',
    'Attendance',
    'MemberProfile',
    'MemberService',
    'PostLike',
    'Skill',
    'Need',
    'Offer',
    'Business',
    'IdeaFeedback',
    'MentorshipRelation',
    'CollaborationRequest',
    'StewardshipLog',
    'StewardshipOrg',
]);

// Extension logic
const prisma = prismaClient.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }: any) {
                // Case-insensitive check for unscoped models
                const normalizedModel = model.toLowerCase();
                const isUnscoped = Array.from(UNSCOPED_MODELS).some(m => m.toLowerCase() === normalizedModel);

                if (isUnscoped) {
                    return query(args);
                }

                const store = requestContext.getStore();
                // FALLBACK: Default to City 1 if no context (prevents failures in background jobs/orphaned requests)
                const cityId = store?.cityId || 1; 
                const isSuperAdmin = store?.isSuperAdmin;

                // Only apply scoping if it's NOT a super admin
                if (cityId && !isSuperAdmin) {
                    // For queries with 'where' (Skip findUnique as it only allows unique fields)
                    if ((operation.startsWith('find') && operation !== 'findUnique') || operation.startsWith('update') || operation.startsWith('delete') || operation === 'count') {
                        args.where = { ...args.where, city_id: Number(cityId) };
                    }
                    
                    // For create operations
                    if (operation === 'create') {
                        args.data = { ...args.data, city_id: Number(cityId) };
                    }
                    
                    // For createMany operations
                    if (operation === 'createMany') {
                        if (Array.isArray(args.data)) {
                            args.data = args.data.map((d: any) => ({ ...d, city_id: Number(cityId) }));
                        } else {
                            args.data = { ...args.data, city_id: Number(cityId) };
                        }
                    }
                }
                
                return query(args);
            },
        },
    },
});

// For better type inference in controllers
export type ExtendedPrismaClient = typeof prisma;
export default prisma;
export { prismaClient as basePrisma };