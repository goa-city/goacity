import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export class PostService {
    static async getFeed(page = 1, limit = 10) {
        return prisma.post.findMany({
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        profile_photo: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async createPost(userId: number, data: any) {
        return prisma.post.create({
            data: {
                user_id: userId,
                content: data.content,
                media_url: data.media_url,
                media_type: data.media_type || 'none',
                link_title: data.link_title,
                link_desc: data.link_desc,
                link_image: data.link_image
            },
            include: { user: true }
        });
    }

    static async likePost(userId: number, postId: number) {
        const existing = await prisma.post_likes.findFirst({
            where: { user_id: userId, post_id: postId }
        });

        if (existing) {
            await prisma.post_likes.delete({ where: { id: existing.id } });
            return { liked: false };
        } else {
            await prisma.post_likes.create({
                data: { user_id: userId, post_id: postId }
            });
            return { liked: true };
        }
    }

    static async deletePost(postId: number, userId: number, isSuperAdmin = false) {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new AppError('Post not found', 404);
        
        if (post.user_id !== userId && !isSuperAdmin) {
            throw new AppError('Unauthorized to delete this post', 403);
        }

        return prisma.post.delete({ where: { id: postId } });
    }
}
