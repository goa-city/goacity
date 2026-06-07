import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding Mentorship Module ---');

    // 1. Create Mentorship Intro Page
    const page = await prisma.page.upsert({
        where: { slug: 'mentorship-intro' },
        update: {},
        create: {
            title: 'Mentorship Exchange',
            slug: 'mentorship-intro',
            content: 'The Mentorship Exchange is a relationship-first, Kingdom-centered ecosystem focused on intentional growth, wisdom transfer, and professional transformation. Start your journey by completing the assessment below.',
            city_id: 1
        }
    });
    console.log('✓ Mentorship Intro Page ready:', page.slug);

    // 2. Create Mentee Assessment Form
    const form = await prisma.forms.upsert({
        where: { code: 'mentorship-mentee-assessment' },
        update: {
            redirect_url: '/mentorship/recommendations'
        },
        create: {
            title: 'Mentorship Assessment',
            code: 'mentorship-mentee-assessment',
            description: 'Tell us about your growth goals so we can align you with the right wisdom partner.',
            redirect_url: '/mentorship/recommendations',
            fields_per_page: 1,
            is_active: 1,
            city_id: 1
        }
    });
    console.log('✓ Mentee Assessment Form ready:', form.code);

    // 3. Create Form Fields
    const fields = [
        {
            form_id: form.id,
            field_key: 'mentee_category',
            label: 'What is your current professional stage?',
            field_type: 'select',
            options: ['Student', 'Early Career', 'Mid-Level', 'Executive', 'Entrepreneur'],
            is_required: 1,
            sort_order: 1
        },
        {
            form_id: form.id,
            field_key: 'growth_area',
            label: 'Which area are you most focused on growing in?',
            field_type: 'select',
            options: ['Leadership', 'Theology of Work', 'Technical Skills', 'Financial Stewardship', 'Conflict Resolution'],
            is_required: 1,
            sort_order: 2
        },
        {
            form_id: form.id,
            field_key: 'mentorship_pillars',
            label: 'Which Kingdom pillars resonate most with you?',
            field_type: 'checkbox_group',
            options: ['Stewardship', 'Service', 'Excellence', 'Community', 'Integrity'],
            is_required: 1,
            sort_order: 3
        }
    ];

    for (const field of fields) {
        const existing = await prisma.formField.findFirst({
            where: { form_id: form.id, field_key: field.field_key }
        });

        if (existing) {
            await prisma.formField.update({
                where: { id: existing.id },
                data: field
            });
        } else {
            await prisma.formField.create({
                data: field
            });
        }
    }
    console.log('✓ Mentee Assessment Fields ready');

    console.log('--- Mentorship Module Seeding Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
