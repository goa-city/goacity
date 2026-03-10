import { PrismaClient } from '@prisma/client';
import { requestContext } from './context.js';

const prismaClient = new PrismaClient();

// Extension logic
const prisma = prismaClient.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }: any) {
                // Skip scoping for the City model itself
                if (model === 'City') {
                    return query(args);
                }

                const store = requestContext.getStore();
                const cityId = store?.cityId;
                const isSuperAdmin = store?.isSuperAdmin;

                // Only apply scoping if it's NOT a super admin and we have a cityId
                if (cityId && !isSuperAdmin) {
                    // For queries with 'where'
                    if (operation.startsWith('find') || operation.startsWith('update') || operation.startsWith('delete') || operation === 'count') {
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