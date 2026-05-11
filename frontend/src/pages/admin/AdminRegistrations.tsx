import React from 'react';
import MembersListView from '../../features/admin-members/components/MembersListView';

const AdminRegistrationsPage: React.FC = () => {
    return (
        <MembersListView status="registrations" />
    );
};

export default AdminRegistrationsPage;
