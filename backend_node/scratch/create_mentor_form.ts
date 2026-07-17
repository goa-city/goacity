import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Creating/Updating Mentor Onboarding Form ID 20 ---');

    // 1. Create or Update Form with ID 20
    const form = await prisma.forms.upsert({
        where: { id: 20 },
        update: {
            title: 'Mentor Reflection Form',
            code: 'mentorship-mentor-assessment',
            description: 'Reflect on your calling, experience, and capacity to equip and guide other marketplace leaders.',
            redirect_url: '/mentorship',
            fields_per_page: 1,
            is_active: 1,
            city_id: 1,
            visibility: 'members'
        },
        create: {
            id: 20,
            title: 'Mentor Reflection Form',
            code: 'mentorship-mentor-assessment',
            description: 'Reflect on your calling, experience, and capacity to equip and guide other marketplace leaders.',
            redirect_url: '/mentorship',
            fields_per_page: 1,
            is_active: 1,
            city_id: 1,
            visibility: 'members'
        }
    });
    console.log('✓ Form created/updated successfully with ID:', form.id);

    // Sync sequence for autoincrement ID in PostgreSQL to prevent ID collisions
    try {
        await prisma.$executeRawUnsafe(`
            SELECT setval(
                pg_get_serial_sequence('forms', 'id'), 
                COALESCE((SELECT MAX(id)+1 FROM forms), 1), 
                false
            );
        `);
        console.log('✓ Form sequence reset successfully');
    } catch (seqError) {
        console.warn('⚠️ Could not reset sequence (might be running on a non-PG DB locally):', seqError);
    }

    // 2. Define Questions
    const fields = [
        {
            form_id: form.id,
            field_key: 'mentor_areas',
            label: 'Which areas do you feel called and equipped to mentor in?',
            subtitle: '(Select up to 3)',
            field_type: 'checkbox_group',
            options: [
                'Career & Professional Growth',
                'Business & Entrepreneurship',
                'Leadership & Management',
                'Personal Development',
                'Faith & Calling',
                'Ministry & Missions',
                'Skills & Technical Expertise',
                'Finance & Stewardship'
            ],
            is_required: 1,
            sort_order: 1
        },
        {
            form_id: form.id,
            field_key: 'mentor_skills',
            label: 'What specific skills, experience, or expertise do you bring?',
            subtitle: '(Tags or short text)',
            placeholder: 'e.g. Startup growth, Hiring & recruitment, Public speaking, Leadership...',
            field_type: 'textarea',
            options: [],
            is_required: 1,
            sort_order: 2
        },
        {
            form_id: form.id,
            field_key: 'mentor_target_groups',
            label: 'Which groups of people do you feel best equipped to mentor?',
            subtitle: '(Select all that apply)',
            field_type: 'checkbox_group',
            options: [
                'Students',
                'Young adults',
                'Early-career professionals',
                'Mid-career professionals',
                'Entrepreneurs',
                'Business owners',
                'Leaders & executives',
                'Ministry leaders'
            ],
            is_required: 1,
            sort_order: 3
        },
        {
            form_id: form.id,
            field_key: 'mentor_challenges',
            label: 'What types of challenges do you enjoy helping people overcome?',
            subtitle: '(Select up to 3)',
            field_type: 'checkbox_group',
            options: [
                'Finding clarity and direction',
                'Career decisions',
                'Leadership growth',
                'Business strategy',
                'Building confidence',
                'Discipline and consistency',
                'Communication skills',
                'Faith and purpose',
                'Work-life balance',
                'Starting something new'
            ],
            is_required: 1,
            sort_order: 4
        },
        {
            form_id: form.id,
            field_key: 'mentor_style',
            label: 'How would you describe your mentoring style?',
            subtitle: '(Select up to 3)',
            field_type: 'checkbox_group',
            options: [
                'Strategic advisor',
                'Coach who asks questions',
                'Teacher and trainer',
                'Accountability partner',
                'Encourager and supporter',
                'Spiritual guide',
                'Practical problem solver',
                'Connector and network builder'
            ],
            is_required: 1,
            sort_order: 5
        },
        {
            form_id: form.id,
            field_key: 'mentor_relationship_types',
            label: 'What types of mentorship relationships are you open to?',
            subtitle: '(Select all that apply)',
            field_type: 'checkbox_group',
            options: [
                'One-time wisdom sessions',
                'Short-term mentoring (1–3 months)',
                'Long-term mentoring (6–12 months)',
                'Group mentoring',
                'Business incubator mentoring'
            ],
            is_required: 1,
            sort_order: 6
        },
        {
            form_id: form.id,
            field_key: 'mentor_capacity_size',
            label: 'How many mentees can you realistically support at one time?',
            subtitle: '(Select one)',
            field_type: 'select',
            options: [
                '1–2',
                '3–5',
                '5–10',
                'More than 10',
                'Depends on the mentorship type'
            ],
            is_required: 1,
            sort_order: 7
        },
        {
            form_id: form.id,
            field_key: 'mentor_meeting_frequency',
            label: 'How often are you available to meet?',
            subtitle: '(Select one)',
            field_type: 'select',
            options: [
                'Weekly',
                'Every two weeks',
                'Monthly',
                'Flexible',
                'Project based'
            ],
            is_required: 1,
            sort_order: 8
        },
        {
            form_id: form.id,
            field_key: 'mentor_why',
            label: 'Why do you want to mentor?',
            subtitle: '(Short answer)',
            placeholder: 'e.g. To invest in the next generation, to share what God has taught me...',
            field_type: 'textarea',
            options: [],
            is_required: 1,
            sort_order: 9
        },
        {
            form_id: form.id,
            field_key: 'mentor_principles',
            label: 'What values or principles guide the way you mentor others?',
            subtitle: '(Short answer)',
            placeholder: 'e.g. Integrity, Stewardship, Servant leadership, Excellence, Grace and truth...',
            field_type: 'textarea',
            options: [],
            is_required: 1,
            sort_order: 10
        }
    ];

    // Delete existing fields for this form to prevent stale fields
    await prisma.formField.deleteMany({
        where: { form_id: form.id }
    });
    console.log('✓ Cleared existing fields for Form ID:', form.id);

    // Create the fields sequentially to guarantee sort order
    for (const field of fields) {
        await prisma.formField.create({
            data: field
        });
    }
    console.log('✓ Created 10 mentor assessment fields successfully');

    // Sync formField sequence for autoincrement ID in PostgreSQL to prevent ID collisions
    try {
        await prisma.$executeRawUnsafe(`
            SELECT setval(
                pg_get_serial_sequence('form_fields', 'id'), 
                COALESCE((SELECT MAX(id)+1 FROM form_fields), 1), 
                false
            );
        `);
        console.log('✓ FormFields sequence reset successfully');
    } catch (seqError) {
        console.warn('⚠️ Could not reset FormFields sequence:', seqError);
    }

    console.log('--- Mentor Onboarding Form Seeding Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
