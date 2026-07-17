import React from 'react';
import { useParams } from 'react-router-dom';
import AdminMentorshipDetailView from '../../features/admin-dashboard/components/AdminMentorshipDetailView';

const AdminMentorshipDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return <AdminMentorshipDetailView relationId={id!} />;
};

export default AdminMentorshipDetail;
