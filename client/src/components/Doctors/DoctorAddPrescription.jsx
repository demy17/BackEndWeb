import React from 'react'
import { MainLayout } from '../../layout/MainLayout'
import { DoctorPrescriptionForm } from './DoctorPrescriptionForm'

const DoctorAddPrescription = () => {
  return (
    <MainLayout>
      <DoctorPrescriptionForm
        onSuccess={() => {
          alert("Prescription added successfully!");
        }}
      />
    </MainLayout>
  )
}

export default DoctorAddPrescription
