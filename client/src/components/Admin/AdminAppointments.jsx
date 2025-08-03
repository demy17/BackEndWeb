// Appointments.jsx
import React from 'react'
import { MainLayout } from '../../layout/MainLayout'
import { AdminAppointmentsPage } from './AdminAppointmentsPage'

const AdminAppointments = () => {
  return (
    <MainLayout>
      <AdminAppointmentsPage />
    </MainLayout>
  );
};

export default AdminAppointments;